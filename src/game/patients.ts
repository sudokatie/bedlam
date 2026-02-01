import { GameState, Patient, DiseaseType, GridPosition, Notification } from './types';
import { DISEASES, MAX_PATIENTS, PATIENT_SPAWN_INTERVAL_MS, GRID_SIZE } from './constants';
import { generateId } from './state';
import { findPath, findRoomEntrance } from './pathfinding';
import { findAvailableRoom, getRoomById } from './rooms';
import { gridEquals } from './isometric';

const DISEASE_TYPES: DiseaseType[] = ['bloaty_head', 'slack_tongue', 'invisibility'];

function randomEdgePosition(): GridPosition {
  const edge = Math.floor(Math.random() * 4);
  const pos = Math.floor(Math.random() * GRID_SIZE);
  
  switch (edge) {
    case 0: return { x: 0, y: pos };           // Left
    case 1: return { x: GRID_SIZE - 1, y: pos }; // Right
    case 2: return { x: pos, y: 0 };           // Top
    case 3: return { x: pos, y: GRID_SIZE - 1 }; // Bottom
    default: return { x: 0, y: 0 };
  }
}

export function spawnPatient(state: GameState): GameState {
  const disease = DISEASE_TYPES[Math.floor(Math.random() * DISEASE_TYPES.length)];
  
  const patient: Patient = {
    id: generateId('patient'),
    disease,
    diagnosed: false,
    diagnosisProgress: 0,
    diagnosisChainIndex: 0,
    state: 'arriving',
    position: randomEdgePosition(),
    targetPosition: null,
    path: [],
    patience: 100,
    health: 100,
    targetRoomId: null,
  };
  
  return {
    ...state,
    patients: [...state.patients, patient],
  };
}

export function checkPatientSpawn(state: GameState, currentTime: number): GameState {
  // Don't spawn if paused
  if (state.paused) return state;
  
  // Don't spawn without reception
  const hasReception = state.rooms.some(r => r.type === 'reception' && r.staffId !== null);
  if (!hasReception) return state;
  
  // Don't spawn if at max patients
  if (state.patients.length >= MAX_PATIENTS) return state;
  
  // Check spawn interval
  if (currentTime - state.lastPatientSpawn < PATIENT_SPAWN_INTERVAL_MS) return state;
  
  return {
    ...spawnPatient(state),
    lastPatientSpawn: currentTime,
  };
}

export function updatePatients(state: GameState): GameState {
  let newState = state;
  
  for (const patient of state.patients) {
    newState = updatePatient(newState, patient.id);
  }
  
  // Remove dead or cured patients that have left
  newState = {
    ...newState,
    patients: newState.patients.filter(p => 
      p.state !== 'dead' && 
      (p.state !== 'leaving' || p.path.length > 0)
    ),
  };
  
  return newState;
}

function updatePatient(state: GameState, patientId: string): GameState {
  const patient = state.patients.find(p => p.id === patientId);
  if (!patient) return state;
  
  // Decrement health for all non-leaving/cured patients
  if (patient.state !== 'leaving' && patient.state !== 'cured' && patient.state !== 'dead') {
    const withHealth = decrementHealth(patient);
    if (withHealth.health <= 0) {
      return dieFromIllness(state, withHealth);
    }
    // Update patient with decremented health before other processing
    state = updatePatientInState(state, withHealth);
  }
  
  // Re-fetch patient after health update
  const currentPatient = state.patients.find(p => p.id === patientId);
  if (!currentPatient) return state;
  
  switch (currentPatient.state) {
    case 'arriving':
      return handleArriving(state, currentPatient);
    case 'waiting':
      return handleWaiting(state, currentPatient);
    case 'in_gp':
    case 'in_diagnosis':
    case 'in_treatment':
      // Handled by diagnosis/treatment systems
      return state;
    case 'leaving':
      return handleLeaving(state, currentPatient);
    default:
      return state;
  }
}

function handleArriving(state: GameState, patient: Patient): GameState {
  // Decrement patience while arriving
  let updatedPatient = decrementPatience(patient);
  
  if (updatedPatient.patience <= 0) {
    return leaveAngrily(state, updatedPatient);
  }
  
  // If no path, find reception
  if (updatedPatient.path.length === 0 && !updatedPatient.targetRoomId) {
    const reception = findAvailableRoom(state, 'reception');
    if (reception) {
      const entrance = findRoomEntrance(reception);
      const path = findPath(updatedPatient.position, entrance, state.rooms);
      if (path.length > 0) {
        updatedPatient = {
          ...updatedPatient,
          path: path.slice(1),
          targetRoomId: reception.id,
          targetPosition: entrance,
        };
      }
    }
  }
  
  // Move along path
  if (updatedPatient.path.length > 0) {
    const nextPos = updatedPatient.path[0];
    updatedPatient = {
      ...updatedPatient,
      position: nextPos,
      path: updatedPatient.path.slice(1),
    };
    
    // Check if arrived at reception
    if (updatedPatient.path.length === 0 && updatedPatient.targetPosition) {
      if (gridEquals(updatedPatient.position, updatedPatient.targetPosition)) {
        updatedPatient = {
          ...updatedPatient,
          state: 'waiting',
          targetPosition: null,
        };
      }
    }
  }
  
  return updatePatientInState(state, updatedPatient);
}

function handleWaiting(state: GameState, patient: Patient): GameState {
  let updatedPatient = decrementPatience(patient);
  
  if (updatedPatient.patience <= 0) {
    return leaveAngrily(state, updatedPatient);
  }
  
  // If no current target, find next room
  if (!updatedPatient.targetRoomId || updatedPatient.path.length === 0) {
    const nextRoom = getNextRoomForPatient(state, updatedPatient);
    if (nextRoom) {
      const entrance = findRoomEntrance(nextRoom);
      const path = findPath(updatedPatient.position, entrance, state.rooms);
      if (path.length > 0) {
        updatedPatient = {
          ...updatedPatient,
          path: path.slice(1),
          targetRoomId: nextRoom.id,
          targetPosition: entrance,
        };
      }
    }
  }
  
  // Move along path
  if (updatedPatient.path.length > 0) {
    const nextPos = updatedPatient.path[0];
    updatedPatient = {
      ...updatedPatient,
      position: nextPos,
      path: updatedPatient.path.slice(1),
    };
    
    // Check if arrived at target room
    if (updatedPatient.path.length === 0 && updatedPatient.targetRoomId) {
      const room = getRoomById(state, updatedPatient.targetRoomId);
      if (room && room.staffId && room.patientId === null) {
        // Enter the room
        const newRoomState = room.type === 'gp_office' ? 'in_gp' 
          : DISEASES[updatedPatient.disease].treatmentRoom === room.type ? 'in_treatment'
          : 'in_diagnosis';
        
        updatedPatient = {
          ...updatedPatient,
          state: newRoomState,
          targetPosition: null,
        };
        
        // Update room to have this patient
        const updatedRooms = state.rooms.map(r => 
          r.id === room.id ? { ...r, patientId: updatedPatient.id, state: 'occupied' as const } : r
        );
        
        return {
          ...updatePatientInState(state, updatedPatient),
          rooms: updatedRooms,
        };
      }
    }
  }
  
  return updatePatientInState(state, updatedPatient);
}

function handleLeaving(state: GameState, patient: Patient): GameState {
  if (patient.path.length === 0) {
    // Find path to edge
    const edge = randomEdgePosition();
    const path = findPath(patient.position, edge, state.rooms);
    if (path.length > 0) {
      return updatePatientInState(state, {
        ...patient,
        path: path.slice(1),
        targetPosition: edge,
      });
    }
    // Can't find path, just remove
    return state;
  }
  
  // Move along path
  const nextPos = patient.path[0];
  return updatePatientInState(state, {
    ...patient,
    position: nextPos,
    path: patient.path.slice(1),
  });
}

function getNextRoomForPatient(state: GameState, patient: Patient): ReturnType<typeof findAvailableRoom> {
  const disease = DISEASES[patient.disease];
  
  if (!patient.diagnosed) {
    // Need diagnosis
    if (patient.diagnosisChainIndex < disease.diagnosisChain.length) {
      const roomType = disease.diagnosisChain[patient.diagnosisChainIndex];
      return findAvailableRoom(state, roomType);
    }
  } else {
    // Need treatment
    return findAvailableRoom(state, disease.treatmentRoom);
  }
  
  return null;
}

function decrementPatience(patient: Patient): Patient {
  return {
    ...patient,
    patience: Math.max(0, patient.patience - 0.1),
  };
}

function decrementHealth(patient: Patient): Patient {
  // Health decays slowly over time - sicker patients need treatment faster
  return {
    ...patient,
    health: Math.max(0, patient.health - 0.05),
  };
}

function leaveAngrily(state: GameState, patient: Patient): GameState {
  // Clear from any room
  let updatedRooms = state.rooms;
  if (patient.targetRoomId) {
    updatedRooms = state.rooms.map(r => 
      r.id === patient.targetRoomId ? { ...r, patientId: null, state: 'empty' as const } : r
    );
  }
  
  const updatedPatient: Patient = {
    ...patient,
    state: 'leaving',
    targetRoomId: null,
    path: [],
  };
  
  // Reputation hit
  const newReputation = Math.max(0, state.reputation - 2);
  
  return {
    ...updatePatientInState(state, updatedPatient),
    rooms: updatedRooms,
    reputation: newReputation,
  };
}

function dieFromIllness(state: GameState, patient: Patient): GameState {
  // Patient died from health reaching 0
  const reputationLoss = 5;
  
  // Clear from any room
  let updatedRooms = state.rooms;
  if (patient.targetRoomId) {
    updatedRooms = state.rooms.map(r => 
      r.id === patient.targetRoomId ? { ...r, patientId: null, state: 'empty' as const } : r
    );
  }
  
  // Create notification
  const notification: Notification = {
    id: generateId('notif'),
    message: `Patient died from illness! Reputation -${reputationLoss}`,
    type: 'error',
    timestamp: Date.now(),
  };
  
  return {
    ...state,
    patients: state.patients.filter(p => p.id !== patient.id),
    rooms: updatedRooms,
    patientsDied: state.patientsDied + 1,
    reputation: Math.max(0, state.reputation - reputationLoss),
    notifications: [...state.notifications, notification],
  };
}

export function sendPatientToRoom(state: GameState, patient: Patient, roomId: string): GameState {
  const room = getRoomById(state, roomId);
  if (!room) return state;
  
  const entrance = findRoomEntrance(room);
  const path = findPath(patient.position, entrance, state.rooms);
  
  return updatePatientInState(state, {
    ...patient,
    state: 'waiting',
    targetRoomId: roomId,
    targetPosition: entrance,
    path: path.slice(1),
  });
}

export function removePatient(state: GameState, patientId: string): GameState {
  return {
    ...state,
    patients: state.patients.filter(p => p.id !== patientId),
  };
}

function updatePatientInState(state: GameState, patient: Patient): GameState {
  return {
    ...state,
    patients: state.patients.map(p => p.id === patient.id ? patient : p),
  };
}

export function getPatientById(state: GameState, patientId: string): Patient | null {
  return state.patients.find(p => p.id === patientId) || null;
}

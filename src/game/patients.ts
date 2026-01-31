import { Patient, GameState, GridPosition, DiseaseType } from './types';
import { DISEASE_TYPES, DISEASES, GRID_SIZE, PATIENT_SPAWN_INTERVAL } from './constants';
import { generateId } from './state';
import { findPath } from './pathfinding';

/**
 * Spawn a new patient at a random edge of the map
 */
export function spawnPatient(state: GameState): Patient | null {
  // Pick a random edge and position
  const edge = Math.floor(Math.random() * 4);
  let position: GridPosition;
  
  switch (edge) {
    case 0: // Top edge
      position = { x: Math.floor(Math.random() * GRID_SIZE), y: 0 };
      break;
    case 1: // Right edge
      position = { x: GRID_SIZE - 1, y: Math.floor(Math.random() * GRID_SIZE) };
      break;
    case 2: // Bottom edge
      position = { x: Math.floor(Math.random() * GRID_SIZE), y: GRID_SIZE - 1 };
      break;
    default: // Left edge
      position = { x: 0, y: Math.floor(Math.random() * GRID_SIZE) };
      break;
  }
  
  // Pick a random disease
  const diseaseType = DISEASE_TYPES[Math.floor(Math.random() * DISEASE_TYPES.length)];
  
  const patient: Patient = {
    id: generateId(),
    disease: diseaseType,
    diagnosed: false,
    diagnosisProgress: 0,
    state: 'arriving',
    position,
    targetPosition: null,
    path: [],
    patience: 100,
    health: 100,
    targetRoomId: null,
  };
  
  state.patients.push(patient);
  return patient;
}

/**
 * Find a reception room that has a receptionist and is not occupied
 */
export function findAvailableReception(state: GameState): string | null {
  for (const room of state.rooms) {
    if (room.type === 'reception' && room.staffId && room.patientId === null) {
      return room.id;
    }
  }
  return null;
}

/**
 * Find a GP office that has a doctor and is not occupied
 */
export function findAvailableGP(state: GameState): string | null {
  for (const room of state.rooms) {
    if (room.type === 'gp_office' && room.staffId && room.patientId === null) {
      return room.id;
    }
  }
  return null;
}

/**
 * Find treatment room for a disease that has staff and is not occupied
 */
export function findAvailableTreatmentRoom(state: GameState, diseaseType: DiseaseType): string | null {
  const disease = DISEASES[diseaseType];
  const treatmentType = disease.treatmentRoom;
  
  for (const room of state.rooms) {
    if (room.type === treatmentType && room.staffId && room.patientId === null) {
      return room.id;
    }
  }
  return null;
}

/**
 * Get the entrance position for a room (center of the room's bottom edge)
 */
export function getRoomEntrance(state: GameState, roomId: string): GridPosition | null {
  const room = state.rooms.find(r => r.id === roomId);
  if (!room) return null;
  
  return {
    x: room.position.x + Math.floor(room.width / 2),
    y: room.position.y + room.height,
  };
}

/**
 * Send patient to a specific room
 */
export function sendPatientToRoom(state: GameState, patient: Patient, roomId: string): boolean {
  const entrance = getRoomEntrance(state, roomId);
  if (!entrance) return false;
  
  const path = findPath(patient.position, entrance, state.rooms);
  if (path.length === 0 && (patient.position.x !== entrance.x || patient.position.y !== entrance.y)) {
    return false; // No path found
  }
  
  patient.targetRoomId = roomId;
  patient.targetPosition = entrance;
  patient.path = path;
  
  return true;
}

/**
 * Update a single patient
 */
export function updatePatient(state: GameState, patient: Patient): void {
  switch (patient.state) {
    case 'arriving':
      // Patient just spawned, need to find reception
      const receptionId = findAvailableReception(state);
      if (receptionId) {
        if (sendPatientToRoom(state, patient, receptionId)) {
          patient.state = 'waiting';
        }
      }
      // If no reception, patient waits (patience decreases)
      break;
      
    case 'waiting':
      // Patient is walking to a room or waiting in queue
      if (patient.path.length > 0) {
        // Move along path
        const nextPos = patient.path.shift()!;
        patient.position = nextPos;
      } else if (patient.targetRoomId) {
        // Arrived at room - check in
        const room = state.rooms.find(r => r.id === patient.targetRoomId);
        if (room && room.patientId === null) {
          room.patientId = patient.id;
          if (room.type === 'gp_office') {
            patient.state = 'in_gp';
          } else if (room.type === 'reception') {
            // Checked in at reception, now find GP
            const gpId = findAvailableGP(state);
            if (gpId) {
              room.patientId = null; // Leave reception
              if (sendPatientToRoom(state, patient, gpId)) {
                patient.state = 'waiting';
              }
            }
          } else {
            patient.state = 'in_treatment';
          }
        }
      }
      break;
      
    case 'in_gp':
      // Being diagnosed
      patient.diagnosisProgress += 5;
      if (patient.diagnosisProgress >= 100) {
        patient.diagnosed = true;
        // Leave GP office
        const gpRoom = state.rooms.find(r => r.patientId === patient.id);
        if (gpRoom) {
          gpRoom.patientId = null;
        }
        // Find treatment room
        const treatmentId = findAvailableTreatmentRoom(state, patient.disease);
        if (treatmentId) {
          if (sendPatientToRoom(state, patient, treatmentId)) {
            patient.state = 'waiting';
          }
        } else {
          // No treatment room available, patient leaves angry
          patient.state = 'leaving';
        }
      }
      break;
      
    case 'in_treatment':
      // Being treated - this is handled in the treatment system
      break;
      
    case 'leaving':
      // Patient is walking to exit
      if (patient.path.length > 0) {
        const nextPos = patient.path.shift()!;
        patient.position = nextPos;
      } else {
        // At edge - remove patient
        const idx = state.patients.indexOf(patient);
        if (idx >= 0) {
          state.patients.splice(idx, 1);
        }
      }
      break;
      
    case 'cured':
    case 'dead':
      // Remove from game
      const idx = state.patients.indexOf(patient);
      if (idx >= 0) {
        state.patients.splice(idx, 1);
      }
      break;
  }
  
  // Decrease patience over time (except when being treated)
  if (patient.state === 'waiting' || patient.state === 'arriving') {
    patient.patience -= 0.1;
    if (patient.patience <= 0) {
      // Patient leaves angry
      leaveAngrily(state, patient);
    }
  }
}

/**
 * Make patient leave angrily (affects reputation)
 */
export function leaveAngrily(state: GameState, patient: Patient): void {
  // Clear from any room
  const room = state.rooms.find(r => r.patientId === patient.id);
  if (room) {
    room.patientId = null;
  }
  
  // Set path to nearest edge
  const edges = [
    { x: 0, y: patient.position.y },
    { x: GRID_SIZE - 1, y: patient.position.y },
    { x: patient.position.x, y: 0 },
    { x: patient.position.x, y: GRID_SIZE - 1 },
  ];
  
  // Find closest edge
  let closest = edges[0];
  let minDist = Math.abs(patient.position.x - closest.x) + Math.abs(patient.position.y - closest.y);
  for (const edge of edges) {
    const dist = Math.abs(patient.position.x - edge.x) + Math.abs(patient.position.y - edge.y);
    if (dist < minDist) {
      minDist = dist;
      closest = edge;
    }
  }
  
  patient.path = findPath(patient.position, closest, state.rooms);
  patient.state = 'leaving';
  state.reputation -= 2;
}

/**
 * Update all patients
 */
export function updatePatients(state: GameState): void {
  // Copy array since we might remove patients during iteration
  const patients = [...state.patients];
  for (const patient of patients) {
    updatePatient(state, patient);
  }
}

/**
 * Patient spawning timer state
 */
let lastSpawnTime = 0;

/**
 * Check if we should spawn a new patient
 */
export function checkPatientSpawn(state: GameState, currentTime: number): void {
  if (currentTime - lastSpawnTime >= PATIENT_SPAWN_INTERVAL) {
    // Only spawn if we have a reception
    const hasReception = state.rooms.some(r => r.type === 'reception');
    if (hasReception && state.patients.length < 10) {
      spawnPatient(state);
    }
    lastSpawnTime = currentTime;
  }
}

/**
 * Reset spawn timer (for new game)
 */
export function resetSpawnTimer(): void {
  lastSpawnTime = 0;
}

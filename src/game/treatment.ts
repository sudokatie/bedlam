import { GameState, Patient, Room, Staff, Notification } from './types';
import { DISEASES, WIN_CONDITION } from './constants';
import { generateId } from './state';

export function processTreatment(
  state: GameState, 
  patient: Patient, 
  room: Room, 
  staff: Staff
): GameState {
  if (!patient.diagnosed) return state;
  
  const disease = DISEASES[patient.disease];
  const success = calculateTreatmentSuccess(staff.skill, disease.difficulty);
  
  if (success) {
    return curePatient(state, patient, room);
  } else {
    return killPatient(state, patient, room);
  }
}

export function calculateTreatmentSuccess(staffSkill: number, difficulty: number): boolean {
  // Base success: 70%
  // Skill bonus: +staffSkill/5 percentage points
  // Difficulty penalty: -difficulty/2 percentage points
  const successRate = 70 + (staffSkill / 5) - (difficulty / 2);
  const roll = Math.random() * 100;
  return roll < successRate;
}

export function curePatient(state: GameState, patient: Patient, room: Room): GameState {
  const disease = DISEASES[patient.disease];
  
  // Income from treatment
  const reputationBonus = 1 + (state.reputation / 100);
  const income = Math.floor(disease.treatmentCost * reputationBonus);
  
  // Create notification
  const notification: Notification = {
    id: generateId('notif'),
    message: `Patient cured! +$${income}`,
    type: 'success',
    timestamp: Date.now(),
  };
  
  // Update patient to leaving state
  const updatedPatient: Patient = {
    ...patient,
    state: 'cured',
  };
  
  // Clear room
  const updatedRooms = state.rooms.map(r => 
    r.id === room.id ? { ...r, patientId: null, state: 'empty' as const } : r
  );
  
  // Check win condition
  const newCuredCount = state.patientsCured + 1;
  const won = newCuredCount >= WIN_CONDITION;
  
  return {
    ...state,
    patients: state.patients.map(p => p.id === patient.id ? { ...updatedPatient, state: 'leaving' } : p),
    rooms: updatedRooms,
    cash: state.cash + income,
    patientsCured: newCuredCount,
    reputation: Math.min(100, state.reputation + 1),
    notifications: [...state.notifications, notification],
    won,
    gameOver: won,
  };
}

export function killPatient(state: GameState, patient: Patient, room: Room): GameState {
  // Reputation hit
  const reputationLoss = 5;
  
  // Create notification
  const notification: Notification = {
    id: generateId('notif'),
    message: `Patient died! Reputation -${reputationLoss}`,
    type: 'error',
    timestamp: Date.now(),
  };
  
  // Clear room
  const updatedRooms = state.rooms.map(r => 
    r.id === room.id ? { ...r, patientId: null, state: 'empty' as const } : r
  );
  
  return {
    ...state,
    patients: state.patients.filter(p => p.id !== patient.id),
    rooms: updatedRooms,
    patientsDied: state.patientsDied + 1,
    reputation: Math.max(0, state.reputation - reputationLoss),
    notifications: [...state.notifications, notification],
  };
}

export function processAllTreatments(state: GameState): GameState {
  let newState = state;
  
  for (const room of state.rooms) {
    if (room.patientId && room.staffId) {
      const patient = newState.patients.find(p => p.id === room.patientId);
      const staff = newState.staff.find(s => s.id === room.staffId);
      
      if (patient && staff && patient.state === 'in_treatment' && patient.diagnosed) {
        newState = processTreatment(newState, patient, room, staff);
      }
    }
  }
  
  return newState;
}

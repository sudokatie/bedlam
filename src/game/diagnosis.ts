import { GameState, Patient, Room, Staff, Notification } from './types';
import { DISEASES } from './constants';
import { generateId } from './state';

const GP_VISIT_FEE = 50;

export function processDiagnosis(
  state: GameState, 
  patient: Patient, 
  room: Room, 
  staff: Staff
): GameState {
  if (patient.diagnosed) return state;
  
  const increase = getDiagnosisIncrease(staff.skill);
  const newProgress = Math.min(100, patient.diagnosisProgress + increase);
  const disease = DISEASES[patient.disease];
  
  let updatedPatient: Patient = {
    ...patient,
    diagnosisProgress: newProgress,
  };
  
  // Check if finished with this diagnosis room
  if (newProgress >= 100 / disease.diagnosisChain.length * (patient.diagnosisChainIndex + 1)) {
    updatedPatient = {
      ...updatedPatient,
      diagnosisChainIndex: patient.diagnosisChainIndex + 1,
    };
    
    // Check if fully diagnosed
    if (isFullyDiagnosed(updatedPatient)) {
      updatedPatient = {
        ...updatedPatient,
        diagnosed: true,
        state: 'waiting',
      };
    } else {
      // Need to go to next diagnosis room
      updatedPatient = {
        ...updatedPatient,
        state: 'waiting',
      };
    }
    
    // Clear patient from room
    const updatedRooms = state.rooms.map(r => 
      r.id === room.id ? { ...r, patientId: null, state: 'empty' as const } : r
    );
    
    // Add $50 GP visit fee income
    let newCash = state.cash;
    let notifications = state.notifications;
    if (room.type === 'gp_office') {
      newCash = state.cash + GP_VISIT_FEE;
      const notification: Notification = {
        id: generateId('notif'),
        message: `GP visit fee: +$${GP_VISIT_FEE}`,
        type: 'info',
        timestamp: Date.now(),
      };
      notifications = [...state.notifications, notification];
    }
    
    return {
      ...state,
      patients: state.patients.map(p => p.id === patient.id ? updatedPatient : p),
      rooms: updatedRooms,
      cash: newCash,
      notifications,
    };
  }
  
  return {
    ...state,
    patients: state.patients.map(p => p.id === patient.id ? updatedPatient : p),
  };
}

export function getDiagnosisIncrease(staffSkill: number): number {
  // Base increase: 25-50% per tick based on skill
  return 25 + (staffSkill / 100) * 25;
}

export function getNextDiagnosisRoom(patient: Patient): string | null {
  if (patient.diagnosed) return null;
  
  const disease = DISEASES[patient.disease];
  if (patient.diagnosisChainIndex >= disease.diagnosisChain.length) {
    return null;
  }
  
  return disease.diagnosisChain[patient.diagnosisChainIndex];
}

export function isFullyDiagnosed(patient: Patient): boolean {
  const disease = DISEASES[patient.disease];
  return patient.diagnosisChainIndex >= disease.diagnosisChain.length;
}

export function processAllDiagnosis(state: GameState): GameState {
  let newState = state;
  
  for (const room of state.rooms) {
    if (room.patientId && room.staffId) {
      const patient = state.patients.find(p => p.id === room.patientId);
      const staff = state.staff.find(s => s.id === room.staffId);
      
      if (patient && staff && (patient.state === 'in_gp' || patient.state === 'in_diagnosis')) {
        if (!patient.diagnosed) {
          newState = processDiagnosis(newState, patient, room, staff);
        }
      }
    }
  }
  
  return newState;
}

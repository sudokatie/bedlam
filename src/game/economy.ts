import { GameState, Patient, Notification } from './types';
import { DISEASES, SALARY_INTERVAL_TICKS } from './constants';
import { generateId } from './state';

export function addIncome(state: GameState, amount: number): GameState {
  return {
    ...state,
    cash: state.cash + amount,
  };
}

export function deductExpense(state: GameState, amount: number): GameState {
  const newCash = state.cash - amount;
  
  // Check for bankruptcy
  if (newCash < 0) {
    const notification: Notification = {
      id: generateId('notif'),
      message: 'BANKRUPT! Game Over.',
      type: 'error',
      timestamp: Date.now(),
    };
    
    return {
      ...state,
      cash: newCash,
      gameOver: true,
      won: false,
      notifications: [...state.notifications, notification],
    };
  }
  
  return {
    ...state,
    cash: newCash,
  };
}

export function processSalaries(state: GameState): GameState {
  // Only process on salary interval
  if (state.tick === 0 || state.tick % SALARY_INTERVAL_TICKS !== 0) {
    return state;
  }
  
  // Sum all salaries
  const totalSalaries = state.staff.reduce((sum, staff) => sum + staff.salary, 0);
  
  if (totalSalaries === 0) return state;
  
  // Create notification
  const notification: Notification = {
    id: generateId('notif'),
    message: `Salaries paid: -$${totalSalaries}`,
    type: 'info',
    timestamp: Date.now(),
  };
  
  const newState = deductExpense(state, totalSalaries);
  
  return {
    ...newState,
    notifications: [...newState.notifications, notification],
    lastSalaryTick: state.tick,
  };
}

export function processPatientPayment(state: GameState, patient: Patient): GameState {
  const disease = DISEASES[patient.disease];
  
  // Apply reputation bonus (+10% per 10 reputation points)
  const reputationMultiplier = 1 + (state.reputation / 100);
  const payment = Math.floor(disease.treatmentCost * reputationMultiplier);
  
  return addIncome(state, payment);
}

export function isBankrupt(state: GameState): boolean {
  return state.cash < 0;
}

export function getTickTime(tick: number): { day: number; hour: number } {
  // 1 tick = 1 minute game time
  // 60 ticks = 1 hour
  // 1440 ticks = 1 day
  const totalMinutes = tick;
  const day = Math.floor(totalMinutes / 1440) + 1;
  const hour = Math.floor((totalMinutes % 1440) / 60) + 8; // Start at 8 AM
  
  return { day, hour: hour % 24 };
}

import { GameState } from './types';
import { STARTING_CASH, STARTING_REPUTATION } from './constants';

let idCounter = 0;

export function generateId(prefix: string): string {
  return `${prefix}_${++idCounter}`;
}

export function createInitialState(): GameState {
  idCounter = 0;
  return {
    tick: 0,
    cash: STARTING_CASH,
    reputation: STARTING_REPUTATION,
    rooms: [],
    staff: [],
    patients: [],
    notifications: [],
    selectedTool: 'select',
    buildingType: null,
    selectedId: null,
    paused: false,
    gameSpeed: 1,
    patientsCured: 0,
    patientsDied: 0,
    gameOver: false,
    won: false,
    lastPatientSpawn: 0,
    lastSalaryTick: 0,
  };
}

import { GameState, Room, Staff, Patient, RoomType, StaffType, GridPosition } from './types';
import { STARTING_CASH, STARTING_REPUTATION } from './constants';

/**
 * Create initial game state
 */
export function createInitialState(): GameState {
  return {
    tick: 0,
    cash: STARTING_CASH,
    reputation: STARTING_REPUTATION,
    rooms: [],
    staff: [],
    patients: [],
    selectedTool: 'select',
    buildingType: null,
    hiringType: null,
    selectedId: null,
    paused: false,
    gameSpeed: 1,
    patientsCured: 0,
    patientsDied: 0,
    gameOver: false,
    won: false,
  };
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Add a room to the game state
 */
export function addRoom(state: GameState, type: RoomType, position: GridPosition, width: number, height: number): Room {
  const room: Room = {
    id: generateId(),
    type,
    position,
    width,
    height,
    staffId: null,
    patientId: null,
    state: 'empty',
  };
  state.rooms.push(room);
  return room;
}

/**
 * Add staff to the game state
 */
export function addStaff(state: GameState, type: StaffType, name: string, salary: number): Staff {
  const staff: Staff = {
    id: generateId(),
    type,
    name,
    skill: 50 + Math.floor(Math.random() * 30),
    stamina: 100,
    salary,
    assignedRoomId: null,
    state: 'idle',
    position: { x: 10, y: 10 }, // Spawn at center
    targetPosition: null,
    path: [],
  };
  state.staff.push(staff);
  return staff;
}

/**
 * Find a room by ID
 */
export function findRoom(state: GameState, roomId: string): Room | undefined {
  return state.rooms.find(r => r.id === roomId);
}

/**
 * Find staff by ID
 */
export function findStaff(state: GameState, staffId: string): Staff | undefined {
  return state.staff.find(s => s.id === staffId);
}

/**
 * Find patient by ID
 */
export function findPatient(state: GameState, patientId: string): Patient | undefined {
  return state.patients.find(p => p.id === patientId);
}

/**
 * Check if a grid cell is occupied by a room
 */
export function isCellOccupied(state: GameState, x: number, y: number): boolean {
  for (const room of state.rooms) {
    if (
      x >= room.position.x &&
      x < room.position.x + room.width &&
      y >= room.position.y &&
      y < room.position.y + room.height
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a room can be placed at a position
 */
export function canPlaceRoom(state: GameState, x: number, y: number, width: number, height: number): boolean {
  for (let dx = 0; dx < width; dx++) {
    for (let dy = 0; dy < height; dy++) {
      if (isCellOccupied(state, x + dx, y + dy)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Find room at a grid position
 */
export function findRoomAt(state: GameState, pos: GridPosition): Room | undefined {
  for (const room of state.rooms) {
    if (
      pos.x >= room.position.x &&
      pos.x < room.position.x + room.width &&
      pos.y >= room.position.y &&
      pos.y < room.position.y + room.height
    ) {
      return room;
    }
  }
  return undefined;
}

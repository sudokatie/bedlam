// Staff management

import { Staff, StaffType, GridPosition, GameState, Room } from './types';
import { STAFF_DEFS, ROOM_DEFS } from './constants';
import { findPathToRoom } from './pathfinding';

let staffIdCounter = 0;

/**
 * Generate a unique staff ID
 */
export function generateStaffId(): string {
  return `staff_${++staffIdCounter}`;
}

/**
 * Generate a random staff name
 */
function generateStaffName(type: StaffType): string {
  const firstNames = ['John', 'Jane', 'Alex', 'Sam', 'Chris', 'Pat', 'Morgan', 'Taylor', 'Jordan', 'Casey'];
  const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${STAFF_DEFS[type].name} ${firstName} ${lastName}`;
}

/**
 * Create a new staff member
 */
export function createStaff(type: StaffType, spawnPosition: GridPosition): Staff {
  const def = STAFF_DEFS[type];
  return {
    id: generateStaffId(),
    type,
    name: generateStaffName(type),
    skill: 50 + Math.floor(Math.random() * 30), // 50-80
    stamina: 100,
    salary: def.salary,
    assignedRoomId: null,
    state: 'idle',
    position: spawnPosition,
    targetPosition: null,
    path: [],
  };
}

/**
 * Check if we can afford to hire this staff type
 */
export function canHireStaff(state: GameState, type: StaffType): boolean {
  const def = STAFF_DEFS[type];
  return state.cash >= def.hireCost;
}

/**
 * Hire a new staff member
 */
export function hireStaff(state: GameState, type: StaffType): GameState | null {
  if (!canHireStaff(state, type)) {
    return null;
  }

  const def = STAFF_DEFS[type];
  
  // Spawn near top-left of map
  const spawnPosition = { x: 0, y: 0 };
  const newStaff = createStaff(type, spawnPosition);

  return {
    ...state,
    cash: state.cash - def.hireCost,
    staff: [...state.staff, newStaff],
  };
}

/**
 * Check if a room can accept this staff type
 */
export function canAssignStaffToRoom(staff: Staff, room: Room): boolean {
  const requiredType = ROOM_DEFS[room.type].requiredStaff;
  
  // Staff type must match room requirement
  if (staff.type !== requiredType) {
    return false;
  }
  
  // Room must not already have staff assigned
  if (room.staffId !== null) {
    return false;
  }
  
  return true;
}

/**
 * Assign a staff member to a room
 */
export function assignStaffToRoom(
  state: GameState,
  staffId: string,
  roomId: string
): GameState | null {
  const staffIndex = state.staff.findIndex(s => s.id === staffId);
  const roomIndex = state.rooms.findIndex(r => r.id === roomId);

  if (staffIndex === -1 || roomIndex === -1) {
    return null;
  }

  const staff = state.staff[staffIndex];
  const room = state.rooms[roomIndex];

  // Validate assignment
  const requiredType = ROOM_DEFS[room.type].requiredStaff;
  
  if (staff.type !== requiredType) {
    console.log(`Staff type ${staff.type} cannot work in ${room.type} (needs ${requiredType})`);
    return null;
  }
  
  if (room.staffId !== null) {
    console.log('Room already has staff assigned');
    return null;
  }

  // Calculate path to room
  const path = findPathToRoom(staff.position, room, state.rooms);
  if (path.length === 0) {
    console.log('No path to room');
    return null;
  }

  // Update staff
  const updatedStaff = [...state.staff];
  updatedStaff[staffIndex] = {
    ...staff,
    assignedRoomId: roomId,
    state: 'walking',
    targetPosition: path[path.length - 1],
    path: path.slice(1), // Remove current position
  };

  // Update room
  const updatedRooms = [...state.rooms];
  updatedRooms[roomIndex] = {
    ...room,
    staffId: staffId,
  };

  return {
    ...state,
    staff: updatedStaff,
    rooms: updatedRooms,
  };
}

/**
 * Unassign staff from their current room
 */
export function unassignStaff(state: GameState, staffId: string): GameState {
  const staffIndex = state.staff.findIndex(s => s.id === staffId);
  if (staffIndex === -1) {
    return state;
  }

  const staff = state.staff[staffIndex];
  if (!staff.assignedRoomId) {
    return state;
  }

  const roomIndex = state.rooms.findIndex(r => r.id === staff.assignedRoomId);

  const updatedStaff = [...state.staff];
  updatedStaff[staffIndex] = {
    ...staff,
    assignedRoomId: null,
    state: 'idle',
    targetPosition: null,
    path: [],
  };

  const updatedRooms = [...state.rooms];
  if (roomIndex !== -1) {
    updatedRooms[roomIndex] = {
      ...state.rooms[roomIndex],
      staffId: null,
    };
  }

  return {
    ...state,
    staff: updatedStaff,
    rooms: updatedRooms,
  };
}

/**
 * Move staff along their path
 */
export function updateStaffMovement(state: GameState): GameState {
  const updatedStaff = state.staff.map(staff => {
    if (staff.state !== 'walking' || staff.path.length === 0) {
      return staff;
    }

    // Move to next position in path
    const nextPos = staff.path[0];
    const remainingPath = staff.path.slice(1);

    // Check if reached destination
    if (remainingPath.length === 0) {
      return {
        ...staff,
        position: nextPos,
        path: [],
        state: staff.assignedRoomId ? 'working' as const : 'idle' as const,
        targetPosition: null,
      };
    }

    return {
      ...staff,
      position: nextPos,
      path: remainingPath,
    };
  });

  return {
    ...state,
    staff: updatedStaff,
  };
}

/**
 * Get staff member by ID
 */
export function getStaffById(state: GameState, id: string): Staff | undefined {
  return state.staff.find(s => s.id === id);
}

/**
 * Get all unassigned staff
 */
export function getUnassignedStaff(state: GameState): Staff[] {
  return state.staff.filter(s => s.assignedRoomId === null);
}

/**
 * Get staff assigned to a specific room
 */
export function getStaffInRoom(state: GameState, roomId: string): Staff | undefined {
  return state.staff.find(s => s.assignedRoomId === roomId);
}

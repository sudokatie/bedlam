import { GameState, Staff, StaffType } from './types';
import { STAFF_DEFS, ROOM_DEFS, generateStaffName } from './constants';
import { generateId } from './state';
import { findPath, findRoomEntrance } from './pathfinding';
import { gridEquals } from './isometric';

export function canHireStaff(state: GameState, type: StaffType): boolean {
  const def = STAFF_DEFS[type];
  return state.cash >= def.hireCost;
}

export function hireStaff(state: GameState, type: StaffType): GameState | null {
  if (!canHireStaff(state, type)) return null;
  
  const def = STAFF_DEFS[type];
  const skill = 50 + Math.floor(Math.random() * 31); // 50-80
  
  const staff: Staff = {
    id: generateId('staff'),
    type,
    name: generateStaffName(),
    skill,
    stamina: 100,
    salary: def.salary,
    assignedRoomId: null,
    state: 'idle',
    position: { x: 0, y: 0 }, // Spawn at corner
    targetPosition: null,
    path: [],
  };
  
  return {
    ...state,
    staff: [...state.staff, staff],
    cash: state.cash - def.hireCost,
  };
}

export function assignStaffToRoom(state: GameState, staffId: string, roomId: string): GameState | null {
  const staff = state.staff.find(s => s.id === staffId);
  const room = state.rooms.find(r => r.id === roomId);
  
  if (!staff || !room) return null;
  
  // Validate staff type matches room requirement
  const roomDef = ROOM_DEFS[room.type];
  if (roomDef.requiredStaff !== staff.type) return null;
  
  // Validate room doesn't already have staff
  if (room.staffId !== null) return null;
  
  // Find path to room entrance
  const entrance = findRoomEntrance(room);
  const path = findPath(staff.position, entrance, state.rooms);
  
  if (path.length === 0) return null;
  
  // Update staff
  const updatedStaff = state.staff.map(s => {
    if (s.id === staffId) {
      return {
        ...s,
        assignedRoomId: roomId,
        state: 'walking' as const,
        path: path.slice(1), // Remove current position
        targetPosition: entrance,
      };
    }
    return s;
  });
  
  // Update room
  const updatedRooms = state.rooms.map(r => {
    if (r.id === roomId) {
      return { ...r, staffId };
    }
    return r;
  });
  
  return {
    ...state,
    staff: updatedStaff,
    rooms: updatedRooms,
  };
}

export function unassignStaff(state: GameState, staffId: string): GameState {
  const staff = state.staff.find(s => s.id === staffId);
  if (!staff || !staff.assignedRoomId) return state;
  
  const roomId = staff.assignedRoomId;
  
  const updatedStaff = state.staff.map(s => {
    if (s.id === staffId) {
      return {
        ...s,
        assignedRoomId: null,
        state: 'idle' as const,
      };
    }
    return s;
  });
  
  const updatedRooms = state.rooms.map(r => {
    if (r.id === roomId) {
      return { ...r, staffId: null };
    }
    return r;
  });
  
  return {
    ...state,
    staff: updatedStaff,
    rooms: updatedRooms,
  };
}

export function updateStaffMovement(state: GameState): GameState {
  const updatedStaff = state.staff.map(staff => {
    if (staff.state !== 'walking' || staff.path.length === 0) {
      return staff;
    }
    
    // Move to next position in path
    const nextPos = staff.path[0];
    const newPath = staff.path.slice(1);
    
    // Check if arrived at destination
    if (newPath.length === 0 && staff.targetPosition && gridEquals(nextPos, staff.targetPosition)) {
      return {
        ...staff,
        position: nextPos,
        path: [],
        targetPosition: null,
        state: 'working' as const,
      };
    }
    
    return {
      ...staff,
      position: nextPos,
      path: newPath,
    };
  });
  
  return { ...state, staff: updatedStaff };
}

export function updateStaffAI(state: GameState): GameState {
  // For MVP, staff just work when at their assigned room
  // No additional AI needed beyond movement
  return state;
}

export function getStaffById(state: GameState, staffId: string): Staff | null {
  return state.staff.find(s => s.id === staffId) || null;
}

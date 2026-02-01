import { GameState, GridPosition, Room, RoomType } from './types';
import { ROOM_DEFS } from './constants';
import { isInBounds } from './isometric';
import { generateId } from './state';

export function getRoomTiles(type: RoomType, position: GridPosition): GridPosition[] {
  const def = ROOM_DEFS[type];
  const tiles: GridPosition[] = [];
  
  for (let dx = 0; dx < def.minSize.width; dx++) {
    for (let dy = 0; dy < def.minSize.height; dy++) {
      tiles.push({ x: position.x + dx, y: position.y + dy });
    }
  }
  
  return tiles;
}

export function canPlaceRoom(state: GameState, type: RoomType, position: GridPosition): boolean {
  const def = ROOM_DEFS[type];
  
  // Check cash
  if (state.cash < def.cost) return false;
  
  const tiles = getRoomTiles(type, position);
  
  // Check all tiles are in bounds
  for (const tile of tiles) {
    if (!isInBounds(tile)) return false;
  }
  
  // Check no overlap with existing rooms
  for (const tile of tiles) {
    if (getRoomAtPosition(state.rooms, tile) !== null) return false;
  }
  
  return true;
}

export function placeRoom(state: GameState, type: RoomType, position: GridPosition): GameState | null {
  if (!canPlaceRoom(state, type, position)) return null;
  
  const def = ROOM_DEFS[type];
  
  const room: Room = {
    id: generateId('room'),
    type,
    position,
    width: def.minSize.width,
    height: def.minSize.height,
    staffId: null,
    patientId: null,
    state: 'empty',
  };
  
  return {
    ...state,
    rooms: [...state.rooms, room],
    cash: state.cash - def.cost,
  };
}

export function getRoomAtPosition(rooms: Room[], position: GridPosition): Room | null {
  for (const room of rooms) {
    if (
      position.x >= room.position.x &&
      position.x < room.position.x + room.width &&
      position.y >= room.position.y &&
      position.y < room.position.y + room.height
    ) {
      return room;
    }
  }
  return null;
}

export function findAvailableRoom(state: GameState, type: RoomType): Room | null {
  for (const room of state.rooms) {
    if (room.type === type && room.staffId !== null && room.patientId === null) {
      return room;
    }
  }
  return null;
}

export function getRoomById(state: GameState, roomId: string): Room | null {
  return state.rooms.find(r => r.id === roomId) || null;
}

// Room placement and management

import { Room, RoomType, GridPosition, GameState } from './types';
import { ROOM_DEFS } from './constants';
import { isInBounds } from './isometric';

let roomIdCounter = 0;

/**
 * Generate a unique room ID
 */
export function generateRoomId(): string {
  return `room_${++roomIdCounter}`;
}

/**
 * Check if a room can be placed at the given position
 */
export function canPlaceRoom(
  state: GameState,
  type: RoomType,
  position: GridPosition
): boolean {
  const def = ROOM_DEFS[type];
  const width = def.minSize.width;
  const height = def.minSize.height;

  // Check if we have enough money
  if (state.cash < def.cost) {
    return false;
  }

  // Check all tiles the room would occupy
  for (let dx = 0; dx < width; dx++) {
    for (let dy = 0; dy < height; dy++) {
      const tilePos = { x: position.x + dx, y: position.y + dy };

      // Check bounds
      if (!isInBounds(tilePos)) {
        return false;
      }

      // Check if tile is occupied by another room
      if (isTileOccupied(state.rooms, tilePos)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check if a tile is occupied by any room
 */
export function isTileOccupied(rooms: Room[], position: GridPosition): boolean {
  for (const room of rooms) {
    if (
      position.x >= room.position.x &&
      position.x < room.position.x + room.width &&
      position.y >= room.position.y &&
      position.y < room.position.y + room.height
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Get the room at a given tile position
 */
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

/**
 * Create a new room
 */
export function createRoom(type: RoomType, position: GridPosition): Room {
  const def = ROOM_DEFS[type];
  return {
    id: generateRoomId(),
    type,
    position,
    width: def.minSize.width,
    height: def.minSize.height,
    staffId: null,
    patientId: null,
    state: 'empty',
  };
}

/**
 * Place a room in the game state
 * Returns updated state or null if placement failed
 */
export function placeRoom(
  state: GameState,
  type: RoomType,
  position: GridPosition
): GameState | null {
  if (!canPlaceRoom(state, type, position)) {
    return null;
  }

  const def = ROOM_DEFS[type];
  const room = createRoom(type, position);

  return {
    ...state,
    cash: state.cash - def.cost,
    rooms: [...state.rooms, room],
  };
}

/**
 * Get tiles that a room would occupy
 */
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

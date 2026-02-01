import { canPlaceRoom, placeRoom, getRoomTiles, getRoomAtPosition } from '../game/rooms';
import { createInitialState } from '../game/state';
import { GameState, Room } from '../game/types';

describe('Rooms', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialState();
  });

  describe('canPlaceRoom', () => {
    it('returns true for valid placement', () => {
      expect(canPlaceRoom(state, 'reception', { x: 5, y: 5 })).toBe(true);
    });

    it('returns false when insufficient cash', () => {
      state.cash = 100;
      expect(canPlaceRoom(state, 'reception', { x: 5, y: 5 })).toBe(false);
    });

    it('returns false for out of bounds placement', () => {
      expect(canPlaceRoom(state, 'gp_office', { x: 18, y: 18 })).toBe(false);
    });

    it('returns false for overlapping rooms', () => {
      const room: Room = {
        id: 'existing',
        type: 'gp_office',
        position: { x: 5, y: 5 },
        width: 3,
        height: 3,
        staffId: null,
        patientId: null,
        state: 'empty',
      };
      state.rooms = [room];
      
      expect(canPlaceRoom(state, 'reception', { x: 6, y: 6 })).toBe(false);
    });
  });

  describe('placeRoom', () => {
    it('places room and deducts cost', () => {
      const initialCash = state.cash;
      const result = placeRoom(state, 'reception', { x: 5, y: 5 });
      
      expect(result).not.toBeNull();
      expect(result!.rooms.length).toBe(1);
      expect(result!.rooms[0].type).toBe('reception');
      expect(result!.rooms[0].position).toEqual({ x: 5, y: 5 });
      expect(result!.cash).toBe(initialCash - 500);
    });

    it('returns null for invalid placement', () => {
      state.cash = 100;
      const result = placeRoom(state, 'reception', { x: 5, y: 5 });
      expect(result).toBeNull();
    });
  });

  describe('getRoomTiles', () => {
    it('returns correct tiles for reception', () => {
      const tiles = getRoomTiles('reception', { x: 5, y: 5 });
      expect(tiles).toHaveLength(4); // 2x2
    });

    it('returns correct tiles for gp_office', () => {
      const tiles = getRoomTiles('gp_office', { x: 5, y: 5 });
      expect(tiles).toHaveLength(9); // 3x3
    });
  });

  describe('getRoomAtPosition', () => {
    it('returns room when position is inside', () => {
      const room: Room = {
        id: 'test',
        type: 'gp_office',
        position: { x: 5, y: 5 },
        width: 3,
        height: 3,
        staffId: null,
        patientId: null,
        state: 'empty',
      };
      
      expect(getRoomAtPosition([room], { x: 6, y: 6 })).toBe(room);
    });

    it('returns null when no room at position', () => {
      expect(getRoomAtPosition([], { x: 5, y: 5 })).toBeNull();
    });
  });
});

import { findPath, isWalkable, findRoomEntrance, findPathToRoom } from '../game/pathfinding';
import { Room, RoomType } from '../game/types';

describe('Pathfinding', () => {
  describe('isWalkable', () => {
    it('returns true for empty tiles within bounds', () => {
      expect(isWalkable({ x: 5, y: 5 }, [])).toBe(true);
    });

    it('returns false for tiles outside bounds', () => {
      expect(isWalkable({ x: -1, y: 0 }, [])).toBe(false);
      expect(isWalkable({ x: 0, y: -1 }, [])).toBe(false);
      expect(isWalkable({ x: 20, y: 0 }, [])).toBe(false);
      expect(isWalkable({ x: 0, y: 20 }, [])).toBe(false);
    });

    it('returns false for tiles inside a room when not allowed', () => {
      const room: Room = {
        id: 'test',
        type: 'gp_office' as RoomType,
        position: { x: 5, y: 5 },
        width: 3,
        height: 3,
        staffId: null,
        patientId: null,
        state: 'empty',
      };

      expect(isWalkable({ x: 6, y: 6 }, [room], false)).toBe(false);
      expect(isWalkable({ x: 5, y: 5 }, [room], false)).toBe(false);
    });
  });

  describe('findPath', () => {
    it('returns single position when start equals goal', () => {
      const path = findPath({ x: 5, y: 5 }, { x: 5, y: 5 }, []);
      expect(path).toEqual([{ x: 5, y: 5 }]);
    });

    it('finds direct path with no obstacles', () => {
      const path = findPath({ x: 0, y: 0 }, { x: 3, y: 0 }, []);
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual({ x: 0, y: 0 });
      expect(path[path.length - 1]).toEqual({ x: 3, y: 0 });
    });

    it('finds path around a room', () => {
      const room: Room = {
        id: 'test',
        type: 'gp_office' as RoomType,
        position: { x: 5, y: 4 },
        width: 3,
        height: 3,
        staffId: null,
        patientId: null,
        state: 'empty',
      };

      const path = findPath({ x: 4, y: 5 }, { x: 9, y: 5 }, [room], false);
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual({ x: 4, y: 5 });
      expect(path[path.length - 1]).toEqual({ x: 9, y: 5 });
    });

    it('returns empty array when completely blocked', () => {
      const rooms: Room[] = [
        {
          id: 'block',
          type: 'gp_office' as RoomType,
          position: { x: 0, y: 0 },
          width: 20,
          height: 20,
          staffId: null,
          patientId: null,
          state: 'empty',
        },
      ];

      const path = findPath({ x: 0, y: 0 }, { x: 10, y: 10 }, rooms, false);
      expect(path).toEqual([]);
    });

    it('finds shortest path with 8-directional movement', () => {
      const path = findPath({ x: 0, y: 0 }, { x: 2, y: 2 }, []);
      // With 8-directional movement, diagonal path is shortest: (0,0) -> (1,1) -> (2,2)
      expect(path.length).toBe(3); // Including start position
      expect(path[0]).toEqual({ x: 0, y: 0 });
      expect(path[path.length - 1]).toEqual({ x: 2, y: 2 });
    });
  });

  describe('findRoomEntrance', () => {
    it('returns position outside bottom of room', () => {
      const room: Room = {
        id: 'test',
        type: 'gp_office' as RoomType,
        position: { x: 5, y: 5 },
        width: 3,
        height: 3,
        staffId: null,
        patientId: null,
        state: 'empty',
      };

      const entrance = findRoomEntrance(room);
      expect(entrance).toEqual({ x: 5, y: 8 });
    });
  });

  describe('findPathToRoom', () => {
    it('finds path to room entrance', () => {
      const room: Room = {
        id: 'test',
        type: 'gp_office' as RoomType,
        position: { x: 10, y: 10 },
        width: 3,
        height: 3,
        staffId: null,
        patientId: null,
        state: 'empty',
      };

      const path = findPathToRoom({ x: 5, y: 5 }, room, [room]);
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual({ x: 5, y: 5 });
      expect(path[path.length - 1]).toEqual({ x: 10, y: 13 });
    });
  });
});

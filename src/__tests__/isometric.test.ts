import { 
  gridToScreen, 
  screenToGrid, 
  isInBounds, 
  getTileCorners, 
  gridDistance, 
  gridEquals 
} from '../game/isometric';
import { CANVAS_WIDTH, Y_OFFSET, TILE_WIDTH, TILE_HEIGHT } from '../game/constants';

describe('Isometric', () => {
  describe('gridToScreen', () => {
    it('converts grid (0,0) to center-top of grid', () => {
      const screen = gridToScreen({ x: 0, y: 0 });
      expect(screen.x).toBe(CANVAS_WIDTH / 2);
      expect(screen.y).toBe(Y_OFFSET);
    });

    it('converts positive grid positions correctly', () => {
      const screen = gridToScreen({ x: 1, y: 0 });
      expect(screen.x).toBe(CANVAS_WIDTH / 2 + TILE_WIDTH / 2);
      expect(screen.y).toBe(Y_OFFSET + TILE_HEIGHT / 2);
    });
  });

  describe('screenToGrid', () => {
    it('inverts gridToScreen for valid coordinates', () => {
      const original = { x: 5, y: 5 };
      const screen = gridToScreen(original);
      const result = screenToGrid(screen);
      expect(result.x).toBe(original.x);
      expect(result.y).toBe(original.y);
    });

    it('inverts gridToScreen for corner coordinates', () => {
      const original = { x: 0, y: 0 };
      const screen = gridToScreen(original);
      const result = screenToGrid(screen);
      expect(result.x).toBe(original.x);
      expect(result.y).toBe(original.y);
    });
  });

  describe('isInBounds', () => {
    it('returns true for valid positions', () => {
      expect(isInBounds({ x: 0, y: 0 })).toBe(true);
      expect(isInBounds({ x: 10, y: 10 })).toBe(true);
      expect(isInBounds({ x: 19, y: 19 })).toBe(true);
    });

    it('returns false for negative coordinates', () => {
      expect(isInBounds({ x: -1, y: 0 })).toBe(false);
      expect(isInBounds({ x: 0, y: -1 })).toBe(false);
    });

    it('returns false for coordinates >= GRID_SIZE', () => {
      expect(isInBounds({ x: 20, y: 0 })).toBe(false);
      expect(isInBounds({ x: 0, y: 20 })).toBe(false);
    });
  });

  describe('getTileCorners', () => {
    it('returns 4 corners forming a diamond', () => {
      const corners = getTileCorners({ x: 0, y: 0 });
      expect(corners).toHaveLength(4);
    });

    it('returns corners with correct relative positions', () => {
      const corners = getTileCorners({ x: 5, y: 5 });
      const center = gridToScreen({ x: 5, y: 5 });
      
      // top
      expect(corners[0].x).toBe(center.x);
      expect(corners[0].y).toBe(center.y - TILE_HEIGHT / 2);
      // right
      expect(corners[1].x).toBe(center.x + TILE_WIDTH / 2);
      expect(corners[1].y).toBe(center.y);
      // bottom
      expect(corners[2].x).toBe(center.x);
      expect(corners[2].y).toBe(center.y + TILE_HEIGHT / 2);
      // left
      expect(corners[3].x).toBe(center.x - TILE_WIDTH / 2);
      expect(corners[3].y).toBe(center.y);
    });
  });

  describe('gridDistance', () => {
    it('returns 0 for same position', () => {
      expect(gridDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
    });

    it('returns manhattan distance', () => {
      expect(gridDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7);
      expect(gridDistance({ x: 10, y: 10 }, { x: 5, y: 8 })).toBe(7);
    });
  });

  describe('gridEquals', () => {
    it('returns true for equal positions', () => {
      expect(gridEquals({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(true);
    });

    it('returns false for different positions', () => {
      expect(gridEquals({ x: 5, y: 5 }, { x: 5, y: 6 })).toBe(false);
      expect(gridEquals({ x: 5, y: 5 }, { x: 6, y: 5 })).toBe(false);
    });
  });
});

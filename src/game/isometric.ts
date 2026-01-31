import { GridPosition, ScreenPosition } from './types';
import { TILE_WIDTH, TILE_HEIGHT, CANVAS_WIDTH, GRID_SIZE } from './constants';

/**
 * Convert grid coordinates to screen (pixel) coordinates
 * Returns the center-top of the isometric tile
 */
export function gridToScreen(grid: GridPosition): ScreenPosition {
  return {
    x: (grid.x - grid.y) * (TILE_WIDTH / 2) + CANVAS_WIDTH / 2,
    y: (grid.x + grid.y) * (TILE_HEIGHT / 2) + 50, // Offset from top
  };
}

/**
 * Convert screen (pixel) coordinates to grid coordinates
 */
export function screenToGrid(screen: ScreenPosition): GridPosition {
  const adjustedX = screen.x - CANVAS_WIDTH / 2;
  const adjustedY = screen.y - 50;
  
  const x = Math.floor((adjustedX / (TILE_WIDTH / 2) + adjustedY / (TILE_HEIGHT / 2)) / 2);
  const y = Math.floor((adjustedY / (TILE_HEIGHT / 2) - adjustedX / (TILE_WIDTH / 2)) / 2);
  
  return { x, y };
}

/**
 * Check if grid position is within bounds
 */
export function isInBounds(pos: GridPosition): boolean {
  return pos.x >= 0 && pos.x < GRID_SIZE && pos.y >= 0 && pos.y < GRID_SIZE;
}

/**
 * Get the four corners of an isometric tile in screen coordinates
 */
export function getTileCorners(grid: GridPosition): ScreenPosition[] {
  const center = gridToScreen(grid);
  return [
    { x: center.x, y: center.y }, // Top
    { x: center.x + TILE_WIDTH / 2, y: center.y + TILE_HEIGHT / 2 }, // Right
    { x: center.x, y: center.y + TILE_HEIGHT }, // Bottom
    { x: center.x - TILE_WIDTH / 2, y: center.y + TILE_HEIGHT / 2 }, // Left
  ];
}

/**
 * Calculate Manhattan distance between two grid positions
 */
export function gridDistance(a: GridPosition, b: GridPosition): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Check if two grid positions are equal
 */
export function gridEquals(a: GridPosition, b: GridPosition): boolean {
  return a.x === b.x && a.y === b.y;
}

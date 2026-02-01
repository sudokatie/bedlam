import { GridPosition, ScreenPosition } from './types';
import { TILE_WIDTH, TILE_HEIGHT, CANVAS_WIDTH, GRID_SIZE, Y_OFFSET } from './constants';

export function gridToScreen(grid: GridPosition): ScreenPosition {
  return {
    x: (grid.x - grid.y) * (TILE_WIDTH / 2) + CANVAS_WIDTH / 2,
    y: (grid.x + grid.y) * (TILE_HEIGHT / 2) + Y_OFFSET,
  };
}

export function screenToGrid(screen: ScreenPosition): GridPosition {
  const x = screen.x - CANVAS_WIDTH / 2;
  const y = screen.y - Y_OFFSET;
  return {
    x: Math.floor((x / (TILE_WIDTH / 2) + y / (TILE_HEIGHT / 2)) / 2),
    y: Math.floor((y / (TILE_HEIGHT / 2) - x / (TILE_WIDTH / 2)) / 2),
  };
}

export function isInBounds(pos: GridPosition): boolean {
  return pos.x >= 0 && pos.x < GRID_SIZE && pos.y >= 0 && pos.y < GRID_SIZE;
}

export function getTileCorners(grid: GridPosition): ScreenPosition[] {
  const center = gridToScreen(grid);
  return [
    { x: center.x, y: center.y - TILE_HEIGHT / 2 },           // top
    { x: center.x + TILE_WIDTH / 2, y: center.y },            // right
    { x: center.x, y: center.y + TILE_HEIGHT / 2 },           // bottom
    { x: center.x - TILE_WIDTH / 2, y: center.y },            // left
  ];
}

export function gridDistance(a: GridPosition, b: GridPosition): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function gridEquals(a: GridPosition, b: GridPosition): boolean {
  return a.x === b.x && a.y === b.y;
}

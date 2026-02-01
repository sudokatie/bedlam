import { GridPosition, Room } from './types';
import { isInBounds, gridEquals } from './isometric';

interface PathNode {
  position: GridPosition;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

// 8-directional movement per spec
const DIRECTIONS = [
  { x: 0, y: -1, cost: 1.0 },   // North
  { x: 1, y: 0, cost: 1.0 },    // East
  { x: 0, y: 1, cost: 1.0 },    // South
  { x: -1, y: 0, cost: 1.0 },   // West
  { x: 1, y: -1, cost: 1.414 }, // NE
  { x: 1, y: 1, cost: 1.414 },  // SE
  { x: -1, y: 1, cost: 1.414 }, // SW
  { x: -1, y: -1, cost: 1.414 }, // NW
];

function heuristic(a: GridPosition, b: GridPosition): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function posKey(pos: GridPosition): string {
  return `${pos.x},${pos.y}`;
}

export function isWalkable(
  position: GridPosition, 
  rooms: Room[], 
  allowRoomInteriors: boolean = true
): boolean {
  if (!isInBounds(position)) return false;
  
  // Check if position is inside any room
  for (const room of rooms) {
    const insideX = position.x >= room.position.x && position.x < room.position.x + room.width;
    const insideY = position.y >= room.position.y && position.y < room.position.y + room.height;
    
    if (insideX && insideY) {
      // If we don't allow room interiors, block this tile
      if (!allowRoomInteriors) return false;
      
      // Room entrances are at the bottom edge - allow those
      const isBottomEdge = position.y === room.position.y + room.height - 1;
      const isEntrance = isBottomEdge && position.x === room.position.x;
      if (!isEntrance) return false;
    }
  }
  
  return true;
}

export function findPath(
  start: GridPosition, 
  goal: GridPosition, 
  rooms: Room[],
  allowRoomInteriors: boolean = true
): GridPosition[] {
  // If start equals goal, return single position
  if (gridEquals(start, goal)) {
    return [{ ...start }];
  }
  
  // Check if goal is walkable
  if (!isWalkable(goal, rooms, allowRoomInteriors)) {
    return [];
  }
  
  const openSet: PathNode[] = [];
  const closedSet = new Set<string>();
  
  const startNode: PathNode = {
    position: { ...start },
    g: 0,
    h: heuristic(start, goal),
    f: heuristic(start, goal),
    parent: null,
  };
  
  openSet.push(startNode);
  
  let iterations = 0;
  const maxIterations = 1000;
  
  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;
    
    // Find node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    
    // Check if reached goal
    if (gridEquals(current.position, goal)) {
      const path: GridPosition[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift({ ...node.position });
        node = node.parent;
      }
      return path;
    }
    
    closedSet.add(posKey(current.position));
    
    // Explore neighbors
    for (const dir of DIRECTIONS) {
      const neighborPos = {
        x: current.position.x + dir.x,
        y: current.position.y + dir.y,
      };
      
      const key = posKey(neighborPos);
      
      if (closedSet.has(key)) continue;
      if (!isWalkable(neighborPos, rooms, allowRoomInteriors)) continue;
      
      const g = current.g + dir.cost;
      const h = heuristic(neighborPos, goal);
      const f = g + h;
      
      // Check if already in open set with better score
      const existing = openSet.find(n => posKey(n.position) === key);
      if (existing) {
        if (g < existing.g) {
          existing.g = g;
          existing.f = f;
          existing.parent = current;
        }
        continue;
      }
      
      openSet.push({
        position: neighborPos,
        g,
        h,
        f,
        parent: current,
      });
    }
  }
  
  return []; // No path found
}

export function findRoomEntrance(room: Room): GridPosition {
  // Entrance is at bottom-left corner of room
  return {
    x: room.position.x,
    y: room.position.y + room.height,
  };
}

export function findPathToRoom(
  start: GridPosition, 
  room: Room, 
  rooms: Room[]
): GridPosition[] {
  const entrance = findRoomEntrance(room);
  return findPath(start, entrance, rooms);
}

// A* pathfinding implementation

import { GridPosition, Room } from './types';
import { isInBounds, gridEquals, gridDistance } from './isometric';

interface PathNode {
  position: GridPosition;
  g: number; // Cost from start
  h: number; // Heuristic (estimated cost to goal)
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

/**
 * Check if a tile is walkable (not blocked by a room interior)
 * Entities can walk on room edges but not through room interiors
 */
export function isWalkable(
  position: GridPosition,
  rooms: Room[],
  allowRoomEdges: boolean = false
): boolean {
  if (!isInBounds(position)) {
    return false;
  }

  for (const room of rooms) {
    const inRoomX = position.x >= room.position.x && position.x < room.position.x + room.width;
    const inRoomY = position.y >= room.position.y && position.y < room.position.y + room.height;

    if (inRoomX && inRoomY) {
      if (allowRoomEdges) {
        // Allow walking on the edge tiles (entrance)
        const isEdge =
          position.x === room.position.x ||
          position.x === room.position.x + room.width - 1 ||
          position.y === room.position.y ||
          position.y === room.position.y + room.height - 1;
        if (!isEdge) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get neighboring walkable positions
 */
function getNeighbors(
  position: GridPosition,
  rooms: Room[],
  allowRoomEdges: boolean
): GridPosition[] {
  const directions = [
    { x: 0, y: -1 }, // Up
    { x: 1, y: 0 },  // Right
    { x: 0, y: 1 },  // Down
    { x: -1, y: 0 }, // Left
  ];

  const neighbors: GridPosition[] = [];

  for (const dir of directions) {
    const newPos = {
      x: position.x + dir.x,
      y: position.y + dir.y,
    };

    if (isWalkable(newPos, rooms, allowRoomEdges)) {
      neighbors.push(newPos);
    }
  }

  return neighbors;
}

/**
 * Find the node with lowest f score in the open set
 */
function getLowestFScore(openSet: PathNode[]): PathNode {
  let lowest = openSet[0];
  for (const node of openSet) {
    if (node.f < lowest.f) {
      lowest = node;
    }
  }
  return lowest;
}

/**
 * Reconstruct the path from the goal node back to start
 */
function reconstructPath(goalNode: PathNode): GridPosition[] {
  const path: GridPosition[] = [];
  let current: PathNode | null = goalNode;

  while (current !== null) {
    path.unshift(current.position);
    current = current.parent;
  }

  return path;
}

/**
 * Find position in set by grid coordinates
 */
function findInSet(set: PathNode[], position: GridPosition): PathNode | undefined {
  return set.find(node => gridEquals(node.position, position));
}

/**
 * A* pathfinding algorithm
 * Returns array of GridPositions from start to goal (inclusive)
 * Returns empty array if no path found
 */
export function findPath(
  start: GridPosition,
  goal: GridPosition,
  rooms: Room[],
  allowRoomEdges: boolean = true
): GridPosition[] {
  // If start equals goal, return single position
  if (gridEquals(start, goal)) {
    return [start];
  }

  // If goal is not walkable, find nearest walkable tile
  if (!isWalkable(goal, rooms, allowRoomEdges)) {
    return [];
  }

  const openSet: PathNode[] = [];
  const closedSet: PathNode[] = [];

  // Initialize with start node
  const startNode: PathNode = {
    position: start,
    g: 0,
    h: gridDistance(start, goal),
    f: gridDistance(start, goal),
    parent: null,
  };
  openSet.push(startNode);

  // Limit iterations to prevent infinite loops
  const maxIterations = 1000;
  let iterations = 0;

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;

    // Get node with lowest f score
    const current = getLowestFScore(openSet);

    // Check if we reached the goal
    if (gridEquals(current.position, goal)) {
      return reconstructPath(current);
    }

    // Move current from open to closed
    const currentIndex = openSet.indexOf(current);
    openSet.splice(currentIndex, 1);
    closedSet.push(current);

    // Check all neighbors
    const neighbors = getNeighbors(current.position, rooms, allowRoomEdges);

    for (const neighborPos of neighbors) {
      // Skip if already in closed set
      if (findInSet(closedSet, neighborPos)) {
        continue;
      }

      const tentativeG = current.g + 1; // Cost of 1 per step

      let neighborNode = findInSet(openSet, neighborPos);

      if (!neighborNode) {
        // New node, add to open set
        neighborNode = {
          position: neighborPos,
          g: tentativeG,
          h: gridDistance(neighborPos, goal),
          f: tentativeG + gridDistance(neighborPos, goal),
          parent: current,
        };
        openSet.push(neighborNode);
      } else if (tentativeG < neighborNode.g) {
        // Found a better path to this node
        neighborNode.g = tentativeG;
        neighborNode.f = tentativeG + neighborNode.h;
        neighborNode.parent = current;
      }
    }
  }

  // No path found
  return [];
}

/**
 * Find the nearest entrance point to a room
 */
export function findRoomEntrance(room: Room): GridPosition {
  // Use the bottom-left corner of the room as entrance
  return {
    x: room.position.x,
    y: room.position.y + room.height - 1,
  };
}

/**
 * Get path to a room's entrance
 */
export function findPathToRoom(
  start: GridPosition,
  targetRoom: Room,
  rooms: Room[]
): GridPosition[] {
  const entrance = findRoomEntrance(targetRoom);
  return findPath(start, entrance, rooms, true);
}

import { GameState, GridPosition, RoomType } from './types';
import { placeRoom, getRoomAtPosition } from './rooms';
import { assignStaffToRoom } from './staff';

export function handleKeyDown(state: GameState, key: string): GameState {
  switch (key) {
    case '1':
      return enterBuildMode(state, 'reception');
    case '2':
      return enterBuildMode(state, 'gp_office');
    case '3':
      return enterBuildMode(state, 'pharmacy');
    case '4':
      return enterBuildMode(state, 'deflation');
    case ' ':
      return { ...state, paused: !state.paused };
    case '+':
    case '=':
      return { ...state, gameSpeed: Math.min(3, state.gameSpeed + 1) as 1 | 2 | 3 };
    case '-':
      return { ...state, gameSpeed: Math.max(1, state.gameSpeed - 1) as 1 | 2 | 3 };
    case 'Escape':
      return cancelAction(state);
    default:
      return state;
  }
}

function enterBuildMode(state: GameState, type: RoomType): GameState {
  return {
    ...state,
    buildingType: type,
    selectedTool: 'build',
    selectedId: null,
  };
}

function cancelAction(state: GameState): GameState {
  return {
    ...state,
    buildingType: null,
    selectedTool: 'select',
    selectedId: null,
  };
}

export function handleClick(
  state: GameState,
  gridPos: GridPosition,
  selectedStaffId: string | null,
  setSelectedStaffId: (id: string | null) => void
): GameState {
  // Build mode: place room
  if (state.buildingType) {
    const newState = placeRoom(state, state.buildingType, gridPos);
    if (newState) {
      return {
        ...newState,
        buildingType: null,
        selectedTool: 'select',
      };
    }
    return state;
  }

  // Staff assignment mode: assign selected staff to clicked room
  if (selectedStaffId) {
    const room = getRoomAtPosition(state.rooms, gridPos);
    if (room) {
      const newState = assignStaffToRoom(state, selectedStaffId, room.id);
      if (newState) {
        setSelectedStaffId(null);
        return newState;
      }
    }
    return state;
  }

  // Check if clicked on a staff member
  for (const staff of state.staff) {
    if (staff.position.x === gridPos.x && staff.position.y === gridPos.y) {
      setSelectedStaffId(staff.id);
      return state;
    }
  }
  
  return state;
}

export function handleRightClick(state: GameState): GameState {
  return cancelAction(state);
}

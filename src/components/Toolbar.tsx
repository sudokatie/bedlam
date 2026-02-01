'use client';

import { memo } from 'react';
import { GameState, RoomType, StaffType } from '../game/types';
import { ROOM_DEFS, STAFF_DEFS } from '../game/constants';
import { canHireStaff } from '../game/staff';

interface ToolbarProps {
  state: GameState;
  onBuildSelect: (type: RoomType) => void;
  onHireClick: (type: StaffType) => void;
  onSelectTool: () => void;
  onDemolishSelect: () => void;
}

const ROOM_TYPES: RoomType[] = ['reception', 'gp_office', 'pharmacy', 'deflation'];
const STAFF_TYPES: StaffType[] = ['receptionist', 'doctor', 'nurse'];

function Toolbar({ state, onBuildSelect, onHireClick, onSelectTool, onDemolishSelect }: ToolbarProps) {
  return (
    <div className="flex gap-4 mb-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onSelectTool}
          className={`px-3 py-1 rounded text-sm ${
            state.selectedTool === 'select'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Select
        </button>
        <button
          onClick={onDemolishSelect}
          className={`px-3 py-1 rounded text-sm ${
            state.selectedTool === 'demolish'
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Demolish
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">Rooms:</span>
        {ROOM_TYPES.map((type) => {
          const def = ROOM_DEFS[type];
          const canAfford = state.cash >= def.cost;
          const isSelected = state.buildingType === type;
          
          return (
            <button
              key={type}
              onClick={() => onBuildSelect(type)}
              disabled={!canAfford}
              className={`px-3 py-1 rounded text-sm ${
                isSelected
                  ? 'bg-yellow-600 text-white'
                  : canAfford
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {def.name} (${def.cost})
            </button>
          );
        })}
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">Staff:</span>
        {STAFF_TYPES.map((type) => {
          const def = STAFF_DEFS[type];
          const canAfford = canHireStaff(state, type);
          
          return (
            <button
              key={type}
              onClick={() => onHireClick(type)}
              disabled={!canAfford}
              className={`px-3 py-1 rounded text-sm ${
                canAfford
                  ? 'bg-purple-700 text-gray-200 hover:bg-purple-600'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {def.name} (${def.hireCost})
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(Toolbar);

'use client';

import { memo, useState } from 'react';
import { GameState, RoomType, StaffType } from '../game/types';
import { ROOM_DEFS, STAFF_DEFS } from '../game/constants';
import { canHireStaff } from '../game/staff';
import { Music } from '../game/music';
import { soundSystem as Sound } from '../game/sound';

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
  const [showAudio, setShowAudio] = useState(false);
  const [musicVolume, setMusicVolume] = useState(Music.getVolume());
  const [soundVolume, setSoundVolume] = useState(Sound.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(Music.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(Sound.isEnabled());

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    Music.setVolume(vol);
  };

  const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSoundVolume(vol);
    Sound.setVolume(vol);
  };

  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    Music.setEnabled(newState);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    Sound.setEnabled(newState);
  };

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

      {/* Audio Settings */}
      <div className="relative ml-auto">
        <button
          onClick={() => setShowAudio(!showAudio)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-200"
        >
          Audio
        </button>
        {showAudio && (
          <div className="absolute right-0 top-full mt-1 p-3 bg-gray-800 border border-gray-700 rounded-lg w-48 z-50">
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-gray-400">Music</label>
                <button
                  onClick={toggleMusic}
                  className={`px-2 py-0.5 rounded text-xs ${musicEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                >
                  {musicEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <input type="range" min="0" max="1" step="0.01" value={musicVolume}
                onChange={handleMusicVolumeChange} disabled={!musicEnabled}
                className="w-full h-1 bg-gray-700 rounded appearance-none accent-blue-500 disabled:opacity-50" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-gray-400">Sound</label>
                <button
                  onClick={toggleSound}
                  className={`px-2 py-0.5 rounded text-xs ${soundEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                >
                  {soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <input type="range" min="0" max="1" step="0.01" value={soundVolume}
                onChange={handleSoundVolumeChange} disabled={!soundEnabled}
                className="w-full h-1 bg-gray-700 rounded appearance-none accent-blue-500 disabled:opacity-50" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(Toolbar);

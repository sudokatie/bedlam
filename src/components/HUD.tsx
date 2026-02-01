'use client';

import { memo } from 'react';
import { getTickTime } from '../game/economy';
import { WIN_CONDITION } from '../game/constants';

interface HUDProps {
  cash: number;
  reputation: number;
  tick: number;
  gameSpeed: 1 | 2 | 3;
  paused: boolean;
  patientsCured: number;
  onSpeedChange: (speed: 1 | 2 | 3) => void;
  onPauseToggle: () => void;
}

function HUD({
  cash,
  reputation,
  tick,
  gameSpeed,
  paused,
  patientsCured,
  onSpeedChange,
  onPauseToggle,
}: HUDProps) {
  const { day, hour } = getTickTime(tick);
  
  return (
    <div className="flex items-center gap-6 bg-gray-800 px-4 py-2 rounded-lg mb-2">
      <div className="text-white font-mono">
        <span className="text-gray-400 text-sm">Cash:</span>{' '}
        <span className={cash < 1000 ? 'text-red-400' : 'text-green-400'}>
          ${cash.toLocaleString()}
        </span>
      </div>
      
      <div className="text-white font-mono">
        <span className="text-gray-400 text-sm">Rep:</span>{' '}
        <span className="text-yellow-400">{reputation}/100</span>
      </div>
      
      <div className="text-white font-mono">
        <span className="text-gray-400 text-sm">Day {day}</span>{' '}
        <span className="text-blue-400">{hour.toString().padStart(2, '0')}:00</span>
      </div>
      
      <div className="text-white font-mono">
        <span className="text-gray-400 text-sm">Cured:</span>{' '}
        <span className="text-cyan-400">{patientsCured}/{WIN_CONDITION}</span>
      </div>
      
      <div className="flex gap-1">
        {[1, 2, 3].map((speed) => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed as 1 | 2 | 3)}
            className={`px-2 py-1 rounded text-sm font-mono ${
              gameSpeed === speed
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
      
      <button
        onClick={onPauseToggle}
        className={`px-3 py-1 rounded text-sm font-mono ${
          paused
            ? 'bg-yellow-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        {paused ? 'PAUSED' : 'PAUSE'}
      </button>
    </div>
  );
}

export default memo(HUD);

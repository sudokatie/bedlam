'use client';

import { memo, useEffect, useState } from 'react';

interface VirtualControlsProps {
  paused: boolean;
  gameSpeed: 1 | 2 | 3;
  onPause: () => void;
  onSpeedUp: () => void;
  onSpeedDown: () => void;
  onCancel: () => void;
}

function VirtualControls({
  paused,
  gameSpeed,
  onPause,
  onSpeedUp,
  onSpeedDown,
  onCancel,
}: VirtualControlsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect touch capability
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show on mobile/touch devices
  if (!isMobile) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
      {/* Speed controls */}
      <button
        onClick={onSpeedDown}
        disabled={gameSpeed <= 1}
        className="w-12 h-12 rounded-full bg-gray-800/80 text-white text-xl font-bold
                   disabled:opacity-40 active:bg-gray-600 touch-manipulation"
        aria-label="Slow down"
      >
        -
      </button>
      
      {/* Pause button */}
      <button
        onClick={onPause}
        className="w-14 h-12 rounded-full bg-blue-700/80 text-white text-sm font-medium
                   active:bg-blue-500 touch-manipulation"
        aria-label={paused ? 'Resume' : 'Pause'}
      >
        {paused ? '▶' : '⏸'}
      </button>
      
      <button
        onClick={onSpeedUp}
        disabled={gameSpeed >= 3}
        className="w-12 h-12 rounded-full bg-gray-800/80 text-white text-xl font-bold
                   disabled:opacity-40 active:bg-gray-600 touch-manipulation"
        aria-label="Speed up"
      >
        +
      </button>
      
      {/* Speed indicator */}
      <div className="w-12 h-12 rounded-full bg-gray-900/60 text-yellow-400 
                      flex items-center justify-center text-sm font-mono">
        {gameSpeed}x
      </div>
      
      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="w-12 h-12 rounded-full bg-red-800/80 text-white text-xs font-medium
                   active:bg-red-600 touch-manipulation"
        aria-label="Cancel"
      >
        ESC
      </button>
    </div>
  );
}

export default memo(VirtualControls);

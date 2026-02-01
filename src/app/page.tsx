'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GridPosition, RoomType, StaffType } from '../game/types';
import { createInitialState } from '../game/state';
import { createGameLoop } from '../game/loop';
import { handleKeyDown, handleRightClick } from '../game/input';
import { hireStaff } from '../game/staff';
import { placeRoom, getRoomAtPosition } from '../game/rooms';
import { assignStaffToRoom } from '../game/staff';
import GameCanvas from '../components/GameCanvas';
import HUD from '../components/HUD';
import Toolbar from '../components/Toolbar';
import InfoPanel from '../components/InfoPanel';
import Notifications from '../components/Notifications';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [hoveredTile, setHoveredTile] = useState<GridPosition | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const gameLoopRef = useRef<ReturnType<typeof createGameLoop> | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Initialize game loop once
  useEffect(() => {
    gameLoopRef.current = createGameLoop(
      () => gameStateRef.current,
      setGameState,
      () => {}
    );
    gameLoopRef.current.start();
    
    return () => {
      gameLoopRef.current?.stop();
    };
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ') e.preventDefault();
      setGameState(prev => handleKeyDown(prev, e.key));
      if (e.key === 'Escape') setSelectedStaffId(null);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleCanvasClick = useCallback((gridPos: GridPosition) => {
    setGameState(prev => {
      // Build mode
      if (prev.buildingType) {
        const newState = placeRoom(prev, prev.buildingType, gridPos);
        if (newState) {
          return {
            ...newState,
            buildingType: null,
            selectedTool: 'select',
          };
        }
        return prev;
      }
      return prev;
    });

    // Staff assignment mode (needs current state)
    if (selectedStaffId) {
      const room = getRoomAtPosition(gameState.rooms, gridPos);
      if (room) {
        const newState = assignStaffToRoom(gameState, selectedStaffId, room.id);
        if (newState) {
          setGameState(newState);
          setSelectedStaffId(null);
        }
      }
      return;
    }

    // Check if clicked on a staff member
    for (const staff of gameState.staff) {
      if (staff.position.x === gridPos.x && staff.position.y === gridPos.y) {
        setSelectedStaffId(staff.id);
        return;
      }
    }
  }, [gameState, selectedStaffId]);

  const handleCanvasRightClick = useCallback(() => {
    setGameState(prev => handleRightClick(prev));
    setSelectedStaffId(null);
  }, []);

  const handleBuildSelect = useCallback((type: RoomType) => {
    setSelectedStaffId(null);
    setGameState(prev => ({
      ...prev,
      buildingType: type,
      selectedTool: 'build',
    }));
  }, []);

  const handleHireClick = useCallback((type: StaffType) => {
    setGameState(prev => {
      const newState = hireStaff(prev, type);
      return newState || prev;
    });
  }, []);

  const handleSpeedChange = useCallback((speed: 1 | 2 | 3) => {
    setGameState(prev => ({ ...prev, gameSpeed: speed }));
  }, []);

  const handlePauseToggle = useCallback(() => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  }, []);

  const handleDismissNotification = useCallback((id: string) => {
    setGameState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
    }));
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-2">Bedlam</h1>
      
      <HUD
        cash={gameState.cash}
        reputation={gameState.reputation}
        tick={gameState.tick}
        gameSpeed={gameState.gameSpeed}
        paused={gameState.paused}
        patientsCured={gameState.patientsCured}
        onSpeedChange={handleSpeedChange}
        onPauseToggle={handlePauseToggle}
      />
      
      <Toolbar
        state={gameState}
        onBuildSelect={handleBuildSelect}
        onHireClick={handleHireClick}
        onSelectTool={() => setGameState(prev => ({ ...prev, selectedTool: 'select', buildingType: null }))}
      />
      
      <div className="flex gap-4">
        <GameCanvas
          state={gameState}
          hoveredTile={hoveredTile}
          selectedId={selectedStaffId}
          onHoverChange={setHoveredTile}
          onClick={handleCanvasClick}
          onRightClick={handleCanvasRightClick}
        />
        
        <InfoPanel
          state={gameState}
          selectedId={selectedStaffId}
        />
      </div>
      
      <div className="mt-2 text-gray-500 text-sm">
        {gameState.buildingType && 'Click to place room. '}
        {selectedStaffId && 'Click a room to assign staff. '}
        {hoveredTile && `(${hoveredTile.x}, ${hoveredTile.y})`}
        {' | ESC to cancel | Space to pause | 1-4 for rooms'}
      </div>
      
      <Notifications
        notifications={gameState.notifications}
        onDismiss={handleDismissNotification}
      />
      
      {gameState.gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {gameState.won ? 'Victory!' : 'Game Over'}
            </h2>
            <p className="text-gray-300 mb-4">
              {gameState.won 
                ? `You cured ${gameState.patientsCured} patients!`
                : 'Your hospital went bankrupt.'}
            </p>
            <button
              onClick={() => setGameState(createInitialState())}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GridPosition, RoomType, StaffType } from '../game/types';
import { createInitialState } from '../game/state';
import { createGameLoop } from '../game/loop';
import { handleKeyDown, handleRightClick } from '../game/input';
import { hireStaff } from '../game/staff';
import { placeRoom, getRoomAtPosition, demolishRoom } from '../game/rooms';
import { assignStaffToRoom } from '../game/staff';
import GameCanvas from '../components/GameCanvas';
import HUD from '../components/HUD';
import Toolbar from '../components/Toolbar';
import InfoPanel from '../components/InfoPanel';
import Notifications from '../components/Notifications';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [hoveredTile, setHoveredTile] = useState<GridPosition | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);  // Can be staff, patient, or room ID
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
      if (e.key === 'Escape') setSelectedId(null);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleCanvasClick = useCallback((gridPos: GridPosition) => {
    // Demolish mode
    if (gameState.selectedTool === 'demolish') {
      const room = getRoomAtPosition(gameState.rooms, gridPos);
      if (room) {
        const newState = demolishRoom(gameState, room.id);
        if (newState) {
          setGameState(newState);
        }
      }
      return;
    }

    // Build mode
    if (gameState.buildingType) {
      const newState = placeRoom(gameState, gameState.buildingType, gridPos);
      if (newState) {
        setGameState({
          ...newState,
          buildingType: null,
          selectedTool: 'select',
        });
      }
      return;
    }

    // Staff assignment mode - if staff selected, assign to clicked room
    if (selectedId?.startsWith('staff_')) {
      const room = getRoomAtPosition(gameState.rooms, gridPos);
      if (room) {
        const newState = assignStaffToRoom(gameState, selectedId, room.id);
        if (newState) {
          setGameState(newState);
          setSelectedId(null);
        }
      }
      return;
    }

    // Check if clicked on a staff member
    for (const staff of gameState.staff) {
      if (staff.position.x === gridPos.x && staff.position.y === gridPos.y) {
        setSelectedId(staff.id);
        return;
      }
    }

    // Check if clicked on a patient
    for (const patient of gameState.patients) {
      if (patient.position.x === gridPos.x && patient.position.y === gridPos.y) {
        setSelectedId(patient.id);
        return;
      }
    }

    // Check if clicked on a room
    const room = getRoomAtPosition(gameState.rooms, gridPos);
    if (room) {
      setSelectedId(room.id);
      return;
    }

    // Clicked on nothing - deselect
    setSelectedId(null);
  }, [gameState, selectedId]);

  const handleCanvasRightClick = useCallback(() => {
    setGameState(prev => handleRightClick(prev));
    setSelectedId(null);
  }, []);

  const handleBuildSelect = useCallback((type: RoomType) => {
    setSelectedId(null);
    setGameState(prev => ({
      ...prev,
      buildingType: type,
      selectedTool: 'build',
    }));
  }, []);

  const handleDemolishSelect = useCallback(() => {
    setSelectedId(null);
    setGameState(prev => ({
      ...prev,
      buildingType: null,
      selectedTool: 'demolish',
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
        onSelectTool={() => {
          setSelectedId(null);
          setGameState(prev => ({ ...prev, selectedTool: 'select', buildingType: null }));
        }}
        onDemolishSelect={handleDemolishSelect}
      />
      
      <div className="flex gap-4">
        <GameCanvas
          state={gameState}
          hoveredTile={hoveredTile}
          selectedId={selectedId}
          onHoverChange={setHoveredTile}
          onClick={handleCanvasClick}
          onRightClick={handleCanvasRightClick}
        />
        
        <InfoPanel
          state={gameState}
          selectedId={selectedId}
        />
      </div>
      
      <div className="mt-2 text-gray-500 text-sm">
        {gameState.buildingType && 'Click to place room. '}
        {gameState.selectedTool === 'demolish' && 'Click a room to demolish (50% refund). '}
        {selectedId?.startsWith('staff_') && 'Click a room to assign staff. '}
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

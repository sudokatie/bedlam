'use client';

import { useEffect, useRef, useState } from 'react';
import { GameState, GridPosition, RoomType, StaffType } from '../game/types';
import { createInitialState } from '../game/state';
import { screenToGrid, isInBounds, getTileCorners, gridToScreen } from '../game/isometric';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, COLORS, ROOM_DEFS, STAFF_DEFS } from '../game/constants';
import { canPlaceRoom, placeRoom, getRoomTiles, getRoomAtPosition } from '../game/rooms';
import { hireStaff, assignStaffToRoom, updateStaffMovement, canHireStaff } from '../game/staff';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [hoveredTile, setHoveredTile] = useState<GridPosition | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  // Render the game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const corners = getTileCorners({ x, y });
        
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        ctx.lineTo(corners[1].x, corners[1].y);
        ctx.lineTo(corners[2].x, corners[2].y);
        ctx.lineTo(corners[3].x, corners[3].y);
        ctx.closePath();
        
        // Highlight hovered tile (only if not in build mode)
        if (!gameState.buildingType && hoveredTile && hoveredTile.x === x && hoveredTile.y === y) {
          ctx.fillStyle = COLORS.highlight;
        } else {
          ctx.fillStyle = COLORS.grass;
        }
        ctx.fill();
        
        ctx.strokeStyle = COLORS.gridLine;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw placed rooms
    for (const room of gameState.rooms) {
      const def = ROOM_DEFS[room.type];
      
      // Draw each tile of the room
      for (let dx = 0; dx < room.width; dx++) {
        for (let dy = 0; dy < room.height; dy++) {
          const tilePos = { x: room.position.x + dx, y: room.position.y + dy };
          const corners = getTileCorners(tilePos);
          
          ctx.beginPath();
          ctx.moveTo(corners[0].x, corners[0].y);
          ctx.lineTo(corners[1].x, corners[1].y);
          ctx.lineTo(corners[2].x, corners[2].y);
          ctx.lineTo(corners[3].x, corners[3].y);
          ctx.closePath();
          
          ctx.fillStyle = def.color;
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Draw room label at center
      const centerX = room.position.x + room.width / 2 - 0.5;
      const centerY = room.position.y + room.height / 2 - 0.5;
      const screenPos = gridToScreen({ x: centerX, y: centerY });
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(def.name, screenPos.x, screenPos.y + 5);
    }

    // Draw room ghost in build mode
    if (gameState.buildingType && hoveredTile) {
      const canPlace = canPlaceRoom(gameState, gameState.buildingType, hoveredTile);
      const tiles = getRoomTiles(gameState.buildingType, hoveredTile);
      
      for (const tile of tiles) {
        if (!isInBounds(tile)) continue;
        
        const corners = getTileCorners(tile);
        
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        ctx.lineTo(corners[1].x, corners[1].y);
        ctx.lineTo(corners[2].x, corners[2].y);
        ctx.lineTo(corners[3].x, corners[3].y);
        ctx.closePath();
        
        ctx.fillStyle = canPlace ? COLORS.validPlacement : COLORS.invalidPlacement;
        ctx.fill();
        ctx.strokeStyle = canPlace ? '#0f0' : '#f00';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Draw staff
    for (const staff of gameState.staff) {
      const screenPos = gridToScreen(staff.position);
      const def = STAFF_DEFS[staff.type];
      
      // Draw staff as circle
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y + 8, 10, 0, Math.PI * 2);
      ctx.fillStyle = selectedStaffId === staff.id ? '#ffff00' : def.color;
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw staff initial
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(staff.type[0].toUpperCase(), screenPos.x, screenPos.y + 12);
    }

    // Draw HUD
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText(`Cash: $${gameState.cash.toLocaleString()}`, 20, 30);
    ctx.fillText(`Reputation: ${gameState.reputation}`, 20, 50);
    ctx.fillText(`Cured: ${gameState.patientsCured}`, 20, 70);
    ctx.fillText(`Rooms: ${gameState.rooms.length} | Staff: ${gameState.staff.length}`, 20, 90);
    
    if (gameState.buildingType) {
      const def = ROOM_DEFS[gameState.buildingType];
      ctx.fillStyle = '#ffff00';
      ctx.fillText(`Building: ${def.name} ($${def.cost})`, 20, 120);
      ctx.fillText(`Press ESC to cancel`, 20, 140);
    }

    if (selectedStaffId) {
      ctx.fillStyle = '#00ffff';
      ctx.fillText(`Staff selected - click a room to assign`, 20, 120);
      ctx.fillText(`Press ESC to cancel`, 20, 140);
    }
    
    if (hoveredTile) {
      ctx.fillStyle = '#888888';
      ctx.fillText(`Tile: (${hoveredTile.x}, ${hoveredTile.y})`, 20, CANVAS_HEIGHT - 20);
    }

  }, [gameState, hoveredTile, selectedStaffId]);

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    const gridPos = screenToGrid(screenPos);
    if (isInBounds(gridPos)) {
      setHoveredTile(gridPos);
    } else {
      setHoveredTile(null);
    }
  };

  // Handle click
  const handleClick = () => {
    if (!hoveredTile) return;
    
    // Build mode: place room
    if (gameState.buildingType) {
      const newState = placeRoom(gameState, gameState.buildingType, hoveredTile);
      if (newState) {
        setGameState({
          ...newState,
          buildingType: null, // Exit build mode after placing
        });
        console.log(`Placed ${gameState.buildingType} at (${hoveredTile.x}, ${hoveredTile.y})`);
      } else {
        console.log('Cannot place room here');
      }
      return;
    }

    // Staff assignment mode: assign selected staff to clicked room
    if (selectedStaffId) {
      const room = getRoomAtPosition(gameState.rooms, hoveredTile);
      if (room) {
        const newState = assignStaffToRoom(gameState, selectedStaffId, room.id);
        if (newState) {
          setGameState(newState);
          setSelectedStaffId(null);
          console.log(`Assigned staff to ${room.type}`);
        } else {
          console.log('Cannot assign staff to this room');
        }
      } else {
        console.log('No room at this position');
      }
      return;
    }

    // Check if clicked on a staff member
    for (const staff of gameState.staff) {
      if (staff.position.x === hoveredTile.x && staff.position.y === hoveredTile.y) {
        setSelectedStaffId(staff.id);
        console.log(`Selected staff: ${staff.name}`);
        return;
      }
    }
    
    console.log(`Clicked tile: (${hoveredTile.x}, ${hoveredTile.y})`);
  };

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGameState(prev => ({
          ...prev,
          buildingType: null,
          selectedTool: 'select',
        }));
        setSelectedStaffId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Game tick for staff movement
  useEffect(() => {
    if (gameState.paused) return;

    const interval = setInterval(() => {
      setGameState(prev => updateStaffMovement(prev));
    }, 200); // Move every 200ms

    return () => clearInterval(interval);
  }, [gameState.paused]);

  // Start building a room
  const startBuilding = (type: RoomType) => {
    setSelectedStaffId(null);
    setGameState(prev => ({
      ...prev,
      buildingType: type,
      selectedTool: 'build',
    }));
  };

  // Hire a staff member
  const handleHireStaff = (type: StaffType) => {
    const newState = hireStaff(gameState, type);
    if (newState) {
      setGameState(newState);
      console.log(`Hired ${type}`);
    } else {
      console.log(`Cannot afford ${type}`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-4">Bedlam</h1>
      <p className="text-gray-400 mb-4">Theme Hospital style hospital management</p>
      
      <div className="flex gap-4 mb-2">
        <span className="text-gray-400 self-center">Rooms:</span>
        <button
          onClick={() => startBuilding('reception')}
          className={`px-3 py-1 rounded text-sm ${
            gameState.buildingType === 'reception' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Reception ($500)
        </button>
        <button
          onClick={() => startBuilding('gp_office')}
          className={`px-3 py-1 rounded text-sm ${
            gameState.buildingType === 'gp_office' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          GP Office ($1000)
        </button>
        <button
          onClick={() => startBuilding('pharmacy')}
          className={`px-3 py-1 rounded text-sm ${
            gameState.buildingType === 'pharmacy' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Pharmacy ($1500)
        </button>
        <button
          onClick={() => startBuilding('deflation')}
          className={`px-3 py-1 rounded text-sm ${
            gameState.buildingType === 'deflation' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Deflation ($2000)
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <span className="text-gray-400 self-center">Staff:</span>
        <button
          onClick={() => handleHireStaff('receptionist')}
          disabled={!canHireStaff(gameState, 'receptionist')}
          className={`px-3 py-1 rounded text-sm ${
            canHireStaff(gameState, 'receptionist')
              ? 'bg-purple-700 text-gray-200 hover:bg-purple-600'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          Receptionist ($200)
        </button>
        <button
          onClick={() => handleHireStaff('doctor')}
          disabled={!canHireStaff(gameState, 'doctor')}
          className={`px-3 py-1 rounded text-sm ${
            canHireStaff(gameState, 'doctor')
              ? 'bg-blue-700 text-gray-200 hover:bg-blue-600'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          Doctor ($500)
        </button>
        <button
          onClick={() => handleHireStaff('nurse')}
          disabled={!canHireStaff(gameState, 'nurse')}
          className={`px-3 py-1 rounded text-sm ${
            canHireStaff(gameState, 'nurse')
              ? 'bg-pink-700 text-gray-200 hover:bg-pink-600'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          Nurse ($300)
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-700 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
      <div className="mt-4 text-gray-400 text-sm">
        Click a build button, then click on the grid to place. Press ESC to cancel.
      </div>
    </main>
  );
}

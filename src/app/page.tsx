'use client';

import { useEffect, useRef, useState } from 'react';
import { GameState, GridPosition } from '../game/types';
import { createInitialState } from '../game/state';
import { screenToGrid, isInBounds, getTileCorners } from '../game/isometric';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, COLORS } from '../game/constants';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState] = useState<GameState>(createInitialState);
  const [hoveredTile, setHoveredTile] = useState<GridPosition | null>(null);

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
        
        // Fill tile
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        ctx.lineTo(corners[1].x, corners[1].y);
        ctx.lineTo(corners[2].x, corners[2].y);
        ctx.lineTo(corners[3].x, corners[3].y);
        ctx.closePath();
        
        // Highlight hovered tile
        if (hoveredTile && hoveredTile.x === x && hoveredTile.y === y) {
          ctx.fillStyle = COLORS.highlight;
        } else {
          ctx.fillStyle = COLORS.grass;
        }
        ctx.fill();
        
        // Draw grid lines
        ctx.strokeStyle = COLORS.gridLine;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw rooms (TODO: implement room rendering)
    // Room count: gameState.rooms.length

    // Draw HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText(`Cash: $${gameState.cash.toLocaleString()}`, 20, 30);
    ctx.fillText(`Reputation: ${gameState.reputation}`, 20, 50);
    ctx.fillText(`Cured: ${gameState.patientsCured}`, 20, 70);
    
    if (hoveredTile) {
      ctx.fillText(`Tile: (${hoveredTile.x}, ${hoveredTile.y})`, 20, CANVAS_HEIGHT - 20);
    }

  }, [gameState, hoveredTile]);

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
    
    console.log(`Clicked tile: (${hoveredTile.x}, ${hoveredTile.y})`);
    // TODO: Handle tool actions
  };

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-4">Bedlam</h1>
      <p className="text-gray-400 mb-4">Theme Hospital style hospital management</p>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-700 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
      <div className="mt-4 text-gray-400 text-sm">
        Click tiles to interact. Build system coming soon.
      </div>
    </main>
  );
}

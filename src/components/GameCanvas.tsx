'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GameState, GridPosition } from '../game/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants';
import { screenToGrid, isInBounds } from '../game/isometric';
import { renderGame } from '../game/render';

interface GameCanvasProps {
  state: GameState;
  hoveredTile: GridPosition | null;
  selectedId: string | null;
  onHoverChange: (tile: GridPosition | null) => void;
  onClick: (gridPos: GridPosition) => void;
  onRightClick: () => void;
}

export default function GameCanvas({
  state,
  hoveredTile,
  selectedId,
  onHoverChange,
  onClick,
  onRightClick,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render the game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderGame(ctx, state, hoveredTile, selectedId);
  }, [state, hoveredTile, selectedId]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    const gridPos = screenToGrid(screenPos);
    if (isInBounds(gridPos)) {
      onHoverChange(gridPos);
    } else {
      onHoverChange(null);
    }
  }, [onHoverChange]);

  // Handle click
  const handleClick = useCallback(() => {
    if (hoveredTile) {
      onClick(hoveredTile);
    }
  }, [hoveredTile, onClick]);

  // Handle right click
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick();
  }, [onRightClick]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="border border-gray-700 cursor-crosshair"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    />
  );
}

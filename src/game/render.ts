import { GameState, GridPosition, Room, Staff, Patient } from './types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GRID_SIZE, 
  COLORS, 
  ROOM_DEFS, 
  STAFF_DEFS, 
  DISEASES 
} from './constants';
import { gridToScreen, getTileCorners, isInBounds } from './isometric';
import { getRoomTiles, canPlaceRoom } from './rooms';

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  hoveredTile: GridPosition | null,
  selectedId: string | null
): void {
  // Clear canvas
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Render layers in order
  renderGrid(ctx, state, hoveredTile);
  renderRooms(ctx, state.rooms);
  renderRoomGhost(ctx, state, hoveredTile);
  renderEntities(ctx, state, selectedId);
}

function renderGrid(
  ctx: CanvasRenderingContext2D, 
  state: GameState, 
  hoveredTile: GridPosition | null
): void {
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
      if (!state.buildingType && hoveredTile && hoveredTile.x === x && hoveredTile.y === y) {
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
}

function renderRooms(ctx: CanvasRenderingContext2D, rooms: Room[]): void {
  for (const room of rooms) {
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
}

function renderRoomGhost(
  ctx: CanvasRenderingContext2D, 
  state: GameState, 
  hoveredTile: GridPosition | null
): void {
  if (!state.buildingType || !hoveredTile) return;
  
  const canPlace = canPlaceRoom(state, state.buildingType, hoveredTile);
  const tiles = getRoomTiles(state.buildingType, hoveredTile);
  
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

function renderEntities(
  ctx: CanvasRenderingContext2D, 
  state: GameState, 
  selectedId: string | null
): void {
  // Sort all entities by y position for proper overlap
  const entities: Array<{ type: 'staff' | 'patient'; entity: Staff | Patient; y: number }> = [];
  
  for (const staff of state.staff) {
    entities.push({ type: 'staff', entity: staff, y: staff.position.y });
  }
  for (const patient of state.patients) {
    entities.push({ type: 'patient', entity: patient, y: patient.position.y });
  }
  
  entities.sort((a, b) => a.y - b.y);
  
  for (const { type, entity } of entities) {
    if (type === 'staff') {
      renderStaff(ctx, entity as Staff, selectedId === entity.id);
    } else {
      renderPatient(ctx, entity as Patient);
    }
  }
}

function renderStaff(ctx: CanvasRenderingContext2D, staff: Staff, selected: boolean): void {
  const screenPos = gridToScreen(staff.position);
  const def = STAFF_DEFS[staff.type];
  
  // Draw staff as circle
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y + 8, 10, 0, Math.PI * 2);
  ctx.fillStyle = selected ? '#ffff00' : def.color;
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

function renderPatient(ctx: CanvasRenderingContext2D, patient: Patient): void {
  const screenPos = gridToScreen(patient.position);
  
  // Color based on state
  let color = COLORS.patient;
  if (patient.state === 'cured') color = COLORS.patientCured;
  else if (patient.patience < 30) color = COLORS.patientSick;
  
  // Draw patient as circle (smaller than staff)
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y + 8, 8, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw disease initial
  const disease = DISEASES[patient.disease];
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(disease.name[0], screenPos.x, screenPos.y + 11);
  
  // Draw patience bar above patient
  const barWidth = 16;
  const barHeight = 3;
  ctx.fillStyle = '#333';
  ctx.fillRect(screenPos.x - barWidth / 2, screenPos.y - 8, barWidth, barHeight);
  ctx.fillStyle = patient.patience > 50 ? '#4a7' : patient.patience > 25 ? '#d94' : '#d44';
  ctx.fillRect(screenPos.x - barWidth / 2, screenPos.y - 8, barWidth * (patient.patience / 100), barHeight);
}

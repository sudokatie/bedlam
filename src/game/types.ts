// Grid and positioning
export interface GridPosition {
  x: number;
  y: number;
}

export interface ScreenPosition {
  x: number;
  y: number;
}

// Rooms
export type RoomType = 'reception' | 'gp_office' | 'pharmacy' | 'deflation';

export interface RoomDefinition {
  name: string;
  cost: number;
  minSize: { width: number; height: number };
  requiredStaff: StaffType;
  capacity: number;
  color: string;
}

export interface Room {
  id: string;
  type: RoomType;
  position: GridPosition;
  width: number;
  height: number;
  staffId: string | null;
  patientId: string | null;
  state: 'empty' | 'working' | 'occupied';
}

// Staff
export type StaffType = 'doctor' | 'nurse' | 'receptionist';

export interface StaffDefinition {
  name: string;
  hireCost: number;
  salary: number;
  color: string;
}

export interface Staff {
  id: string;
  type: StaffType;
  name: string;
  skill: number;
  stamina: number;
  salary: number;
  assignedRoomId: string | null;
  state: 'idle' | 'walking' | 'working' | 'resting';
  position: GridPosition;
  targetPosition: GridPosition | null;
  path: GridPosition[];
}

// Patients
export type DiseaseType = 'bloaty_head' | 'slack_tongue' | 'invisibility';

export interface Disease {
  type: DiseaseType;
  name: string;
  diagnosisChain: RoomType[];
  treatmentRoom: RoomType;
  treatmentCost: number;
  difficulty: number;
}

export type PatientState = 
  | 'arriving' 
  | 'waiting' 
  | 'in_gp' 
  | 'in_diagnosis' 
  | 'in_treatment' 
  | 'leaving' 
  | 'cured' 
  | 'dead';

export interface Patient {
  id: string;
  disease: DiseaseType;
  diagnosed: boolean;
  diagnosisProgress: number;
  diagnosisChainIndex: number;
  state: PatientState;
  position: GridPosition;
  targetPosition: GridPosition | null;
  path: GridPosition[];
  patience: number;
  health: number;
  targetRoomId: string | null;
}

// Tools
export type ToolType = 'select' | 'build' | 'hire' | 'demolish';

// Game state
export interface GameState {
  tick: number;
  cash: number;
  reputation: number;
  rooms: Room[];
  staff: Staff[];
  patients: Patient[];
  notifications: Notification[];
  selectedTool: ToolType;
  buildingType: RoomType | null;
  selectedId: string | null;
  paused: boolean;
  gameSpeed: 1 | 2 | 3;
  patientsCured: number;
  patientsDied: number;
  gameOver: boolean;
  won: boolean;
  lastPatientSpawn: number;
  lastSalaryTick: number;
}

// Notification
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

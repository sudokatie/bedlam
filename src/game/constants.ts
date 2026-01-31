import { RoomType, RoomDefinition, StaffType, StaffDefinition, Disease, DiseaseType } from './types';

// Canvas and grid
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;
export const GRID_SIZE = 20;

// Colors
export const COLORS = {
  grass: '#4a7c59',
  gridLine: '#3d6b4a',
  highlight: 'rgba(255, 255, 0, 0.3)',
  invalidPlacement: 'rgba(255, 0, 0, 0.3)',
  validPlacement: 'rgba(0, 255, 0, 0.3)',
  patient: '#e8846b',
  patientSick: '#cf6b8a',
  patientCured: '#6bcf9e',
};

// Game settings
export const STARTING_CASH = 10000;
export const STARTING_REPUTATION = 50;
export const WIN_CONDITION = 20; // patients cured
export const PATIENT_SPAWN_INTERVAL = 5000; // ms
export const SIMULATION_TICK_MS = 100;
export const SALARY_INTERVAL_TICKS = 300; // ~30 seconds

// Room definitions
export const ROOM_DEFS: Record<RoomType, RoomDefinition> = {
  reception: {
    name: 'Reception',
    cost: 500,
    minSize: { width: 2, height: 2 },
    requiredStaff: 'receptionist',
    capacity: 1,
    color: '#8b7355',
  },
  gp_office: {
    name: "GP's Office",
    cost: 1000,
    minSize: { width: 3, height: 3 },
    requiredStaff: 'doctor',
    capacity: 1,
    color: '#6b8e8e',
  },
  pharmacy: {
    name: 'Pharmacy',
    cost: 1500,
    minSize: { width: 3, height: 3 },
    requiredStaff: 'nurse',
    capacity: 1,
    color: '#8e6b8e',
  },
  deflation: {
    name: 'Deflation Room',
    cost: 2000,
    minSize: { width: 4, height: 3 },
    requiredStaff: 'doctor',
    capacity: 1,
    color: '#8e8e6b',
  },
};

// Staff definitions
export const STAFF_DEFS: Record<StaffType, StaffDefinition> = {
  doctor: {
    name: 'Doctor',
    hireCost: 500,
    salary: 200,
    color: '#4a90d9',
  },
  nurse: {
    name: 'Nurse',
    hireCost: 300,
    salary: 150,
    color: '#d94a7b',
  },
  receptionist: {
    name: 'Receptionist',
    hireCost: 200,
    salary: 100,
    color: '#9b59b6',
  },
};

// Disease definitions
export const DISEASES: Record<DiseaseType, Disease> = {
  bloaty_head: {
    type: 'bloaty_head',
    name: 'Bloaty Head',
    diagnosisChain: ['gp_office'],
    treatmentRoom: 'deflation',
    treatmentCost: 300,
    difficulty: 20,
  },
  slack_tongue: {
    type: 'slack_tongue',
    name: 'Slack Tongue',
    diagnosisChain: ['gp_office'],
    treatmentRoom: 'pharmacy',
    treatmentCost: 150,
    difficulty: 10,
  },
  invisibility: {
    type: 'invisibility',
    name: 'Invisibility',
    diagnosisChain: ['gp_office', 'pharmacy'],
    treatmentRoom: 'pharmacy',
    treatmentCost: 200,
    difficulty: 30,
  },
};

// Get all disease types for random selection
export const DISEASE_TYPES: DiseaseType[] = ['bloaty_head', 'slack_tongue', 'invisibility'];

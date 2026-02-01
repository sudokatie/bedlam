import { RoomType, RoomDefinition, StaffType, StaffDefinition, DiseaseType, Disease } from './types';

// Canvas and grid
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;
export const GRID_SIZE = 20;
export const Y_OFFSET = 50;

// Starting resources
export const STARTING_CASH = 10000;
export const STARTING_REPUTATION = 50;

// Win condition
export const WIN_CONDITION = 20;

// Timing
export const SIMULATION_TICK_MS = 100;
export const SALARY_INTERVAL_TICKS = 300;
export const PATIENT_SPAWN_INTERVAL_MS = 5000;
export const MAX_PATIENTS = 10;

// Colors
export const COLORS = {
  grass: '#2d5a27',
  gridLine: '#1a3d15',
  highlight: '#4a8a42',
  validPlacement: 'rgba(0, 255, 0, 0.3)',
  invalidPlacement: 'rgba(255, 0, 0, 0.3)',
  patient: '#e8c547',
  patientSick: '#d44',
  patientCured: '#4d4',
  background: '#1a1a2e',
};

// Room definitions
export const ROOM_DEFS: Record<RoomType, RoomDefinition> = {
  reception: {
    name: 'Reception',
    cost: 500,
    minSize: { width: 2, height: 2 },
    requiredStaff: 'receptionist',
    capacity: 1,
    color: '#6b5b95',
  },
  gp_office: {
    name: "GP's Office",
    cost: 1000,
    minSize: { width: 3, height: 3 },
    requiredStaff: 'doctor',
    capacity: 1,
    color: '#88b04b',
  },
  pharmacy: {
    name: 'Pharmacy',
    cost: 1500,
    minSize: { width: 3, height: 3 },
    requiredStaff: 'nurse',
    capacity: 1,
    color: '#f7cac9',
  },
  deflation: {
    name: 'Deflation Room',
    cost: 2000,
    minSize: { width: 4, height: 3 },
    requiredStaff: 'doctor',
    capacity: 1,
    color: '#92a8d1',
  },
};

// Staff definitions
export const STAFF_DEFS: Record<StaffType, StaffDefinition> = {
  doctor: {
    name: 'Doctor',
    hireCost: 500,
    salary: 100,
    color: '#3498db',
  },
  nurse: {
    name: 'Nurse',
    hireCost: 300,
    salary: 60,
    color: '#e91e63',
  },
  receptionist: {
    name: 'Receptionist',
    hireCost: 200,
    salary: 40,
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

// Staff name generator
const FIRST_NAMES = ['James', 'Mary', 'John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'Robert', 'Anna'];
const LAST_NAMES = ['Smith', 'Jones', 'Brown', 'Wilson', 'Taylor', 'Clark', 'White', 'Hall', 'Young', 'King'];

export function generateStaffName(): string {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}

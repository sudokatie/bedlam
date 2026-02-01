import { spawnPatient, checkPatientSpawn } from '../game/patients';
import { createInitialState } from '../game/state';
import { PATIENT_SPAWN_INTERVAL_MS, MAX_PATIENTS, GRID_SIZE } from '../game/constants';

describe('Patients', () => {
  describe('spawnPatient', () => {
    it('adds a patient to state', () => {
      const state = createInitialState();
      const result = spawnPatient(state);
      expect(result.patients.length).toBe(1);
    });

    it('spawns patient at edge of map', () => {
      const state = createInitialState();
      const result = spawnPatient(state);
      const patient = result.patients[0];
      
      const isAtEdge = 
        patient.position.x === 0 || 
        patient.position.x === GRID_SIZE - 1 ||
        patient.position.y === 0 || 
        patient.position.y === GRID_SIZE - 1;
      
      expect(isAtEdge).toBe(true);
    });

    it('assigns a disease to patient', () => {
      const state = createInitialState();
      const result = spawnPatient(state);
      expect(result.patients[0].disease).toBeDefined();
    });

    it('patient starts with full patience and health', () => {
      const state = createInitialState();
      const result = spawnPatient(state);
      expect(result.patients[0].patience).toBe(100);
      expect(result.patients[0].health).toBe(100);
    });
  });

  describe('checkPatientSpawn', () => {
    it('does not spawn without reception', () => {
      const state = createInitialState();
      const result = checkPatientSpawn(state, Date.now());
      expect(result.patients.length).toBe(0);
    });

    it('does not spawn when paused', () => {
      const state = createInitialState();
      state.paused = true;
      state.rooms = [{
        id: 'reception_1',
        type: 'reception',
        position: { x: 5, y: 5 },
        width: 2,
        height: 2,
        staffId: 'staff_1',
        patientId: null,
        state: 'empty',
      }];
      
      const result = checkPatientSpawn(state, Date.now());
      expect(result.patients.length).toBe(0);
    });

    it('respects max patient limit', () => {
      const state = createInitialState();
      state.rooms = [{
        id: 'reception_1',
        type: 'reception',
        position: { x: 5, y: 5 },
        width: 2,
        height: 2,
        staffId: 'staff_1',
        patientId: null,
        state: 'empty',
      }];
      
      // Fill up to max
      for (let i = 0; i < MAX_PATIENTS; i++) {
        state.patients.push({
          id: `patient_${i}`,
          disease: 'bloaty_head',
          diagnosed: false,
          diagnosisProgress: 0,
          diagnosisChainIndex: 0,
          state: 'arriving',
          position: { x: 0, y: 0 },
          targetPosition: null,
          path: [],
          patience: 100,
          health: 100,
          targetRoomId: null,
        });
      }
      
      const result = checkPatientSpawn(state, Date.now() + PATIENT_SPAWN_INTERVAL_MS * 2);
      expect(result.patients.length).toBe(MAX_PATIENTS);
    });

    it('spawns when conditions are met', () => {
      const state = createInitialState();
      state.rooms = [{
        id: 'reception_1',
        type: 'reception',
        position: { x: 5, y: 5 },
        width: 2,
        height: 2,
        staffId: 'staff_1',
        patientId: null,
        state: 'empty',
      }];
      state.lastPatientSpawn = 0;
      
      const result = checkPatientSpawn(state, PATIENT_SPAWN_INTERVAL_MS + 1);
      expect(result.patients.length).toBe(1);
    });
  });
});

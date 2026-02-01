import { calculateTreatmentSuccess, curePatient, killPatient } from '../game/treatment';
import { createInitialState } from '../game/state';
import { Patient, Room, DiseaseType } from '../game/types';

describe('Treatment', () => {
  const createMockPatient = (): Patient => ({
    id: 'patient_1',
    disease: 'bloaty_head' as DiseaseType,
    diagnosed: true,
    diagnosisProgress: 100,
    diagnosisChainIndex: 1,
    state: 'in_treatment',
    position: { x: 5, y: 5 },
    targetPosition: null,
    path: [],
    patience: 100,
    health: 100,
    targetRoomId: 'room_1',
  });

  const createMockRoom = (): Room => ({
    id: 'room_1',
    type: 'deflation',
    position: { x: 5, y: 5 },
    width: 4,
    height: 3,
    staffId: 'staff_1',
    patientId: 'patient_1',
    state: 'occupied',
  });

  describe('calculateTreatmentSuccess', () => {
    it('has base 70% success rate', () => {
      // With skill 0 and difficulty 0: 70 + 0 - 0 = 70%
      // We can't test random directly, but we can verify the formula
      // by testing extreme cases
      const results = Array.from({ length: 100 }, () => 
        calculateTreatmentSuccess(0, 0)
      );
      const successCount = results.filter(r => r).length;
      // Should be around 70%, allow wide margin for randomness
      expect(successCount).toBeGreaterThan(50);
      expect(successCount).toBeLessThan(90);
    });

    it('high skill increases success rate', () => {
      // skill 100, difficulty 0: 70 + 20 - 0 = 90%
      const results = Array.from({ length: 100 }, () => 
        calculateTreatmentSuccess(100, 0)
      );
      const successCount = results.filter(r => r).length;
      expect(successCount).toBeGreaterThan(70);
    });

    it('high difficulty decreases success rate', () => {
      // skill 0, difficulty 100: 70 + 0 - 50 = 20%
      const results = Array.from({ length: 100 }, () => 
        calculateTreatmentSuccess(0, 100)
      );
      const successCount = results.filter(r => r).length;
      expect(successCount).toBeLessThan(50);
    });
  });

  describe('curePatient', () => {
    it('adds income and increments cured counter', () => {
      const state = createInitialState();
      state.patients = [createMockPatient()];
      state.rooms = [createMockRoom()];
      
      const result = curePatient(state, state.patients[0], state.rooms[0]);
      
      expect(result.cash).toBeGreaterThan(state.cash);
      expect(result.patientsCured).toBe(1);
    });

    it('clears patient from room', () => {
      const state = createInitialState();
      state.patients = [createMockPatient()];
      state.rooms = [createMockRoom()];
      
      const result = curePatient(state, state.patients[0], state.rooms[0]);
      
      const room = result.rooms.find(r => r.id === 'room_1');
      expect(room?.patientId).toBeNull();
    });

    it('adds success notification', () => {
      const state = createInitialState();
      state.patients = [createMockPatient()];
      state.rooms = [createMockRoom()];
      
      const result = curePatient(state, state.patients[0], state.rooms[0]);
      
      expect(result.notifications.length).toBeGreaterThan(0);
      expect(result.notifications[0].type).toBe('success');
    });
  });

  describe('killPatient', () => {
    it('decreases reputation', () => {
      const state = createInitialState();
      state.patients = [createMockPatient()];
      state.rooms = [createMockRoom()];
      
      const result = killPatient(state, state.patients[0], state.rooms[0]);
      
      expect(result.reputation).toBeLessThan(state.reputation);
    });

    it('removes patient', () => {
      const state = createInitialState();
      state.patients = [createMockPatient()];
      state.rooms = [createMockRoom()];
      
      const result = killPatient(state, state.patients[0], state.rooms[0]);
      
      expect(result.patients.length).toBe(0);
    });
  });
});

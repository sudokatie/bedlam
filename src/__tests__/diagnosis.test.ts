import { getDiagnosisIncrease, isFullyDiagnosed, getNextDiagnosisRoom } from '../game/diagnosis';
import { Patient, DiseaseType } from '../game/types';

describe('Diagnosis', () => {
  describe('getDiagnosisIncrease', () => {
    it('returns 25 for skill 0', () => {
      expect(getDiagnosisIncrease(0)).toBe(25);
    });

    it('returns 50 for skill 100', () => {
      expect(getDiagnosisIncrease(100)).toBe(50);
    });

    it('returns value between 25-50 for intermediate skills', () => {
      const result = getDiagnosisIncrease(50);
      expect(result).toBeGreaterThanOrEqual(25);
      expect(result).toBeLessThanOrEqual(50);
    });
  });

  describe('isFullyDiagnosed', () => {
    it('returns true when chain index matches chain length', () => {
      const patient: Patient = {
        id: 'test',
        disease: 'bloaty_head' as DiseaseType,
        diagnosed: false,
        diagnosisProgress: 100,
        diagnosisChainIndex: 1, // bloaty_head has 1 room in chain
        state: 'in_gp',
        position: { x: 0, y: 0 },
        targetPosition: null,
        path: [],
        patience: 100,
        health: 100,
        targetRoomId: null,
      };
      
      expect(isFullyDiagnosed(patient)).toBe(true);
    });

    it('returns false when chain not complete', () => {
      const patient: Patient = {
        id: 'test',
        disease: 'invisibility' as DiseaseType, // has 2 rooms in chain
        diagnosed: false,
        diagnosisProgress: 50,
        diagnosisChainIndex: 0,
        state: 'in_gp',
        position: { x: 0, y: 0 },
        targetPosition: null,
        path: [],
        patience: 100,
        health: 100,
        targetRoomId: null,
      };
      
      expect(isFullyDiagnosed(patient)).toBe(false);
    });
  });

  describe('getNextDiagnosisRoom', () => {
    it('returns first room for new patient', () => {
      const patient: Patient = {
        id: 'test',
        disease: 'bloaty_head' as DiseaseType,
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
      };
      
      expect(getNextDiagnosisRoom(patient)).toBe('gp_office');
    });

    it('returns null when fully diagnosed', () => {
      const patient: Patient = {
        id: 'test',
        disease: 'bloaty_head' as DiseaseType,
        diagnosed: true,
        diagnosisProgress: 100,
        diagnosisChainIndex: 1,
        state: 'waiting',
        position: { x: 0, y: 0 },
        targetPosition: null,
        path: [],
        patience: 100,
        health: 100,
        targetRoomId: null,
      };
      
      expect(getNextDiagnosisRoom(patient)).toBeNull();
    });
  });
});

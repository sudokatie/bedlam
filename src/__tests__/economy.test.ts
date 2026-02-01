import { addIncome, deductExpense, processSalaries, isBankrupt, getTickTime } from '../game/economy';
import { createInitialState } from '../game/state';
import { SALARY_INTERVAL_TICKS } from '../game/constants';

describe('Economy', () => {
  describe('addIncome', () => {
    it('adds amount to cash', () => {
      const state = createInitialState();
      const result = addIncome(state, 500);
      expect(result.cash).toBe(state.cash + 500);
    });
  });

  describe('deductExpense', () => {
    it('subtracts amount from cash', () => {
      const state = createInitialState();
      const result = deductExpense(state, 500);
      expect(result.cash).toBe(state.cash - 500);
    });

    it('triggers bankruptcy when cash goes negative', () => {
      const state = createInitialState();
      state.cash = 100;
      const result = deductExpense(state, 500);
      expect(result.cash).toBe(-400);
      expect(result.gameOver).toBe(true);
    });
  });

  describe('processSalaries', () => {
    it('does nothing on tick 0', () => {
      const state = createInitialState();
      state.tick = 0;
      state.staff = [{ 
        id: 'test', 
        type: 'doctor', 
        name: 'Test', 
        skill: 50, 
        stamina: 100, 
        salary: 100,
        assignedRoomId: null,
        state: 'idle',
        position: { x: 0, y: 0 },
        targetPosition: null,
        path: [],
      }];
      
      const result = processSalaries(state);
      expect(result.cash).toBe(state.cash);
    });

    it('deducts salaries on salary interval', () => {
      const state = createInitialState();
      state.tick = SALARY_INTERVAL_TICKS;
      state.staff = [{ 
        id: 'test', 
        type: 'doctor', 
        name: 'Test', 
        skill: 50, 
        stamina: 100, 
        salary: 100,
        assignedRoomId: null,
        state: 'idle',
        position: { x: 0, y: 0 },
        targetPosition: null,
        path: [],
      }];
      
      const result = processSalaries(state);
      expect(result.cash).toBe(state.cash - 100);
    });
  });

  describe('isBankrupt', () => {
    it('returns true when cash is negative', () => {
      const state = createInitialState();
      state.cash = -100;
      expect(isBankrupt(state)).toBe(true);
    });

    it('returns false when cash is positive', () => {
      const state = createInitialState();
      expect(isBankrupt(state)).toBe(false);
    });
  });

  describe('getTickTime', () => {
    it('returns day 1 hour 8 for tick 0', () => {
      const { day, hour } = getTickTime(0);
      expect(day).toBe(1);
      expect(hour).toBe(8);
    });

    it('calculates correct time for later ticks', () => {
      const { day, hour } = getTickTime(60); // 1 hour later
      expect(day).toBe(1);
      expect(hour).toBe(9);
    });
  });
});

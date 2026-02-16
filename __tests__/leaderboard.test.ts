// Tests for Bedlam leaderboard

import {
  getLeaderboard,
  addEntry,
  getTop,
  wouldRank,
  getRank,
  clearLeaderboard,
  calculateScore,
  LeaderboardEntry,
} from '../src/game/Leaderboard';

// Mock localStorage for Node test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getLeaderboard', () => {
    it('returns empty array when no entries', () => {
      expect(getLeaderboard()).toEqual([]);
    });

    it('returns stored entries', () => {
      const entry: LeaderboardEntry = {
        name: 'General Hospital',
        score: 5000,
        patientsCured: 30,
        cash: 15000,
        reputation: 75,
        date: '2026-02-16',
      };
      addEntry(entry);
      expect(getLeaderboard()).toHaveLength(1);
      expect(getLeaderboard()[0].name).toBe('General Hospital');
    });
  });

  describe('addEntry', () => {
    it('adds entry to leaderboard', () => {
      const entry: LeaderboardEntry = {
        name: 'Mercy Hospital',
        score: 3500,
        patientsCured: 20,
        cash: 10000,
        reputation: 60,
        date: '2026-02-16',
      };
      const result = addEntry(entry);
      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(3500);
    });

    it('sorts entries by score descending', () => {
      addEntry({ name: 'Bad', score: 1000, patientsCured: 5, cash: 2000, reputation: 30, date: '2026-02-16' });
      addEntry({ name: 'Good', score: 8000, patientsCured: 50, cash: 30000, reputation: 90, date: '2026-02-16' });
      addEntry({ name: 'Medium', score: 4000, patientsCured: 25, cash: 15000, reputation: 60, date: '2026-02-16' });
      
      const entries = getLeaderboard();
      expect(entries[0].name).toBe('Good');
      expect(entries[1].name).toBe('Medium');
      expect(entries[2].name).toBe('Bad');
    });

    it('sorts by patients cured when scores equal', () => {
      addEntry({ name: 'FewCured', score: 4000, patientsCured: 20, cash: 20000, reputation: 70, date: '2026-02-16' });
      addEntry({ name: 'ManyCured', score: 4000, patientsCured: 35, cash: 10000, reputation: 65, date: '2026-02-16' });
      
      const entries = getLeaderboard();
      expect(entries[0].name).toBe('ManyCured');
      expect(entries[1].name).toBe('FewCured');
    });

    it('limits to 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        addEntry({
          name: `Hospital${i}`,
          score: i * 500,
          patientsCured: i * 3,
          cash: i * 1000,
          reputation: 50 + i,
          date: '2026-02-16',
        });
      }
      expect(getLeaderboard()).toHaveLength(10);
    });
  });

  describe('getTop', () => {
    it('returns top N entries', () => {
      for (let i = 0; i < 5; i++) {
        addEntry({
          name: `Hospital${i}`,
          score: (i + 1) * 1000,
          patientsCured: (i + 1) * 5,
          cash: (i + 1) * 5000,
          reputation: 50 + (i + 1) * 8,
          date: '2026-02-16',
        });
      }
      const top3 = getTop(3);
      expect(top3).toHaveLength(3);
      expect(top3[0].score).toBe(5000);
    });
  });

  describe('wouldRank', () => {
    it('returns rank when board not full', () => {
      addEntry({ name: 'Test', score: 3000, patientsCured: 15, cash: 10000, reputation: 55, date: '2026-02-16' });
      expect(wouldRank(5000)).toBe(1);
      expect(wouldRank(1000)).toBe(2);
    });

    it('returns null when would not rank on full board', () => {
      for (let i = 0; i < 10; i++) {
        addEntry({
          name: `Hospital${i}`,
          score: (i + 1) * 500,
          patientsCured: (i + 1) * 3,
          cash: (i + 1) * 1000,
          reputation: 50 + i,
          date: '2026-02-16',
        });
      }
      expect(wouldRank(100)).toBeNull();
    });
  });

  describe('getRank', () => {
    it('returns rank for existing score', () => {
      addEntry({ name: 'First', score: 6000, patientsCured: 40, cash: 20000, reputation: 80, date: '2026-02-16' });
      addEntry({ name: 'Second', score: 3000, patientsCured: 20, cash: 10000, reputation: 60, date: '2026-02-16' });
      const entries = getLeaderboard();
      expect(getRank(entries[0].score)).toBe(1);
      expect(getRank(entries[1].score)).toBe(2);
    });

    it('returns null for non-existent score', () => {
      addEntry({ name: 'Test', score: 3000, patientsCured: 15, cash: 10000, reputation: 55, date: '2026-02-16' });
      expect(getRank(10000)).toBeNull();
    });
  });

  describe('clearLeaderboard', () => {
    it('removes all entries', () => {
      addEntry({ name: 'Test', score: 3000, patientsCured: 15, cash: 10000, reputation: 55, date: '2026-02-16' });
      clearLeaderboard();
      expect(getLeaderboard()).toEqual([]);
    });
  });

  describe('calculateScore', () => {
    it('calculates score from hospital stats', () => {
      // 20 cured * 100 = 2000
      // 2 died * 50 = -100
      // 15000 cash / 100 = 150
      // 70 reputation * 10 = 700
      // Total = 2750
      const score = calculateScore(20, 2, 15000, 70);
      expect(score).toBe(2750);
    });

    it('handles new hospital', () => {
      const score = calculateScore(3, 0, 5000, 50);
      expect(score).toBe(300 + 50 + 500); // 850
    });

    it('handles struggling hospital', () => {
      const score = calculateScore(5, 10, 1000, 20);
      // 500 - 500 + 10 + 200 = 210
      expect(score).toBe(210);
    });

    it('never goes below zero', () => {
      const score = calculateScore(0, 20, 0, 0);
      expect(score).toBe(0);
    });
  });
});

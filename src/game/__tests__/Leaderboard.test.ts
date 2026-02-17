/**
 * @jest-environment jsdom
 */

import {
  getLeaderboard,
  addEntry,
  getTop,
  wouldRank,
  getRank,
  clearLeaderboard
} from '../Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty array when no entries', () => {
    expect(getLeaderboard()).toEqual([]);
  });

  it('should add an entry', () => {
    const entry = {
      name: 'DrGood',
      score: 7500,
      patientsCured: 120,
      cash: 50000,
      reputation: 85,
      date: new Date().toISOString()
    };
    const entries = addEntry(entry);
    expect(entries[0].score).toBe(7500);
  });

  it('should sort by score descending', () => {
    addEntry({ name: 'Low', score: 2500, patientsCured: 40, cash: 15000, reputation: 50, date: '2026-01-01' });
    addEntry({ name: 'High', score: 15000, patientsCured: 250, cash: 100000, reputation: 95, date: '2026-01-02' });
    addEntry({ name: 'Mid', score: 7500, patientsCured: 120, cash: 50000, reputation: 75, date: '2026-01-03' });

    const top = getTop();
    expect(top[0].name).toBe('High');
    expect(top[1].name).toBe('Mid');
    expect(top[2].name).toBe('Low');
  });

  it('should limit to max entries', () => {
    for (let i = 0; i < 15; i++) {
      addEntry({ name: `D${i}`, score: i * 1000, patientsCured: i * 15, cash: i * 5000, reputation: i * 6, date: '2026-01-01' });
    }
    expect(getTop().length).toBe(10);
  });

  it('should persist to localStorage', () => {
    addEntry({ name: 'Saved', score: 5000, patientsCured: 80, cash: 35000, reputation: 65, date: '2026-01-01' });
    const stored = JSON.parse(localStorage.getItem('bedlam-leaderboard')!);
    expect(stored[0].name).toBe('Saved');
  });

  it('should check if score would rank', () => {
    addEntry({ name: 'First', score: 10000, patientsCured: 160, cash: 70000, reputation: 80, date: '2026-01-01' });
    expect(wouldRank(12000)).toBe(1);
    expect(wouldRank(5000)).toBe(2);
  });

  it('should get rank by score', () => {
    addEntry({ name: 'First', score: 10000, patientsCured: 160, cash: 70000, reputation: 80, date: '2026-01-01' });
    addEntry({ name: 'Second', score: 6000, patientsCured: 95, cash: 40000, reputation: 60, date: '2026-01-02' });
    expect(getRank(10000)).toBe(1);
    expect(getRank(6000)).toBe(2);
    expect(getRank(99999)).toBeNull();
  });

  it('should clear all data', () => {
    addEntry({ name: 'Gone', score: 3000, patientsCured: 50, cash: 20000, reputation: 45, date: '2026-01-01' });
    clearLeaderboard();
    expect(getLeaderboard().length).toBe(0);
  });

  it('should track hospital stats', () => {
    addEntry({ name: 'Chief', score: 9000, patientsCured: 145, cash: 60000, reputation: 78, date: '2026-01-01' });
    const entry = getTop()[0];
    expect(entry.patientsCured).toBe(145);
    expect(entry.cash).toBe(60000);
    expect(entry.reputation).toBe(78);
  });
});

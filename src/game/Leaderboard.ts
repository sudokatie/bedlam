// Leaderboard for Bedlam - tracks hospital achievements

const STORAGE_KEY = 'bedlam-leaderboard';
const MAX_ENTRIES = 10;

export interface LeaderboardEntry {
  name: string;
  score: number;
  patientsCured: number;
  cash: number;
  reputation: number;
  date: string;
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable
  }
}

export function addEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  const entries = getLeaderboard();
  entries.push(entry);
  
  // Sort by score (descending), then patients cured
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.patientsCured - a.patientsCured;
  });
  
  // Keep top N
  const trimmed = entries.slice(0, MAX_ENTRIES);
  saveLeaderboard(trimmed);
  return trimmed;
}

export function getTop(n: number = MAX_ENTRIES): LeaderboardEntry[] {
  return getLeaderboard().slice(0, n);
}

export function wouldRank(score: number): number | null {
  const entries = getLeaderboard();
  if (entries.length < MAX_ENTRIES) {
    const position = entries.findIndex(e => score > e.score);
    return position === -1 ? entries.length + 1 : position + 1;
  }
  
  const position = entries.findIndex(e => score > e.score);
  if (position === -1) return null;
  return position + 1;
}

export function getRank(score: number): number | null {
  const entries = getLeaderboard();
  const position = entries.findIndex(e => e.score === score);
  return position === -1 ? null : position + 1;
}

export function clearLeaderboard(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Calculate score from hospital stats
export function calculateScore(
  patientsCured: number,
  patientsDied: number,
  cash: number,
  reputation: number
): number {
  let score = 0;
  
  // Cured patients are primary metric
  score += patientsCured * 100;
  
  // Deaths hurt reputation
  score -= patientsDied * 50;
  
  // Cash shows business acumen
  score += Math.floor(cash / 100);
  
  // Reputation multiplier (0-100 scale)
  score += reputation * 10;
  
  return Math.max(0, score);
}

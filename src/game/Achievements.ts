/**
 * Achievement system for Bedlam (Theme Hospital)
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'exploration' | 'mastery' | 'daily';
}

export interface AchievementProgress { unlockedAt: number; }
export type AchievementStore = Record<string, AchievementProgress>;

export const ACHIEVEMENTS: Achievement[] = [
  // Skill
  { id: 'first_cure', name: 'Healer', description: 'Cure your first patient', icon: '💊', category: 'skill' },
  { id: 'first_room', name: 'Planner', description: 'Build your first room', icon: '🏗️', category: 'skill' },
  { id: 'first_hire', name: 'Manager', description: 'Hire your first staff', icon: '👨‍⚕️', category: 'skill' },
  { id: 'epidemic', name: 'Crisis Manager', description: 'Handle an epidemic', icon: '🦠', category: 'skill' },
  { id: 'vip_visit', name: 'Host', description: 'Impress a VIP visitor', icon: '⭐', category: 'skill' },
  { id: 'level_complete', name: 'Administrator', description: 'Complete level 1', icon: '🏥', category: 'skill' },

  // Exploration
  { id: 'all_diseases', name: 'Diagnostician', description: 'Treat all disease types', icon: '🔬', category: 'exploration' },
  { id: 'all_rooms', name: 'Architect', description: 'Build all room types', icon: '🏛️', category: 'exploration' },
  { id: 'research', name: 'Researcher', description: 'Complete a research project', icon: '📚', category: 'exploration' },

  // Mastery
  { id: 'cures_100', name: 'Doctor', description: 'Cure 100 patients', icon: '💯', category: 'mastery' },
  { id: 'reputation_max', name: 'Renowned', description: 'Reach maximum reputation', icon: '🌟', category: 'mastery' },
  { id: 'profit_50000', name: 'Profitable', description: 'Earn $50,000 profit', icon: '💰', category: 'mastery' },
  { id: 'no_deaths', name: 'Perfect Record', description: 'Complete level with no deaths', icon: '👼', category: 'mastery' },
  { id: 'level_5', name: 'Director', description: 'Complete 5 levels', icon: '👑', category: 'mastery' },
  { id: 'speed_run', name: 'Efficient', description: 'Complete a level in 10 minutes', icon: '⚡', category: 'mastery' },

  // Daily
  { id: 'daily_complete', name: 'Daily Doctor', description: 'Complete a daily hospital', icon: '📅', category: 'daily' },
  { id: 'daily_top_10', name: 'Daily Contender', description: 'Top 10 in daily', icon: '🔟', category: 'daily' },
  { id: 'daily_top_3', name: 'Daily Champion', description: 'Top 3 in daily', icon: '🥉', category: 'daily' },
  { id: 'daily_first', name: 'Daily Legend', description: 'First place in daily', icon: '🥇', category: 'daily' },
  { id: 'daily_streak_3', name: 'Consistent', description: '3-day streak', icon: '🔥', category: 'daily' },
  { id: 'daily_streak_7', name: 'Dedicated', description: '7-day streak', icon: '💪', category: 'daily' },
];

const STORAGE_KEY = 'bedlam_achievements';
const STREAK_KEY = 'bedlam_daily_streak';

export class AchievementManager {
  private store: AchievementStore;
  private dailyStreak: { lastDate: string; count: number };
  constructor() { this.store = this.load(); this.dailyStreak = this.loadStreak(); }
  private load(): AchievementStore { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } }
  private save(): void { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store)); } catch {} }
  private loadStreak() { try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"lastDate":"","count":0}'); } catch { return { lastDate: '', count: 0 }; } }
  private saveStreak(): void { try { localStorage.setItem(STREAK_KEY, JSON.stringify(this.dailyStreak)); } catch {} }
  isUnlocked(id: string): boolean { return id in this.store; }
  getProgress(): AchievementStore { return { ...this.store }; }
  getUnlockedCount(): number { return Object.keys(this.store).length; }
  getTotalCount(): number { return ACHIEVEMENTS.length; }
  getAchievement(id: string) { return ACHIEVEMENTS.find((a) => a.id === id); }
  getAllAchievements() { return ACHIEVEMENTS; }
  unlock(id: string): Achievement | null {
    if (this.isUnlocked(id)) return null;
    const a = this.getAchievement(id); if (!a) return null;
    this.store[id] = { unlockedAt: Date.now() }; this.save(); return a;
  }
  checkAndUnlock(ids: string[]): Achievement[] {
    return ids.map((id) => this.unlock(id)).filter((a): a is Achievement => a !== null);
  }
  recordDailyCompletion(rank: number): Achievement[] {
    const unlocked: Achievement[] = [];
    let a = this.unlock('daily_complete'); if (a) unlocked.push(a);
    if (rank <= 10) { a = this.unlock('daily_top_10'); if (a) unlocked.push(a); }
    if (rank <= 3) { a = this.unlock('daily_top_3'); if (a) unlocked.push(a); }
    if (rank === 1) { a = this.unlock('daily_first'); if (a) unlocked.push(a); }
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (this.dailyStreak.lastDate === yesterday) this.dailyStreak.count++;
    else if (this.dailyStreak.lastDate !== today) this.dailyStreak.count = 1;
    this.dailyStreak.lastDate = today; this.saveStreak();
    if (this.dailyStreak.count >= 3) { a = this.unlock('daily_streak_3'); if (a) unlocked.push(a); }
    if (this.dailyStreak.count >= 7) { a = this.unlock('daily_streak_7'); if (a) unlocked.push(a); }
    return unlocked;
  }
  reset(): void { this.store = {}; this.dailyStreak = { lastDate: '', count: 0 }; this.save(); this.saveStreak(); }
}

let instance: AchievementManager | null = null;
export function getAchievementManager(): AchievementManager { if (!instance) instance = new AchievementManager(); return instance; }

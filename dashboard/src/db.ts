import Dexie, { type Table } from 'dexie';

export interface TabData {
  id: string;
  url: string;
  title: string;
  favicon: string;
  domain: string;
  keywords: string[];
  lastAccessed: number;
  clickCount: number;
  isDuplicate?: boolean;
  isDead?: boolean;
  titleKeywords?: string[];
}

export interface TabGroupData {
  id: string;
  name: string;
  color: string;
  tabs: TabData[];
  createdAt: number;
  updatedAt: number;
  isShared: boolean;
  shareUrl?: string;
}

export interface SessionData {
  id: string;
  name: string;
  groups: TabGroupData[];
  createdAt: number;
}

const COLORS = [
  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'bg-pink-500/20 text-pink-300 border-pink-500/30',
];

export function getGroupColor(index: number): string {
  return COLORS[index % COLORS.length];
}

class TabTamerDB extends Dexie {
  sessions!: Table<SessionData>;

  constructor() {
    super('TabTamerDB');
    this.version(1).stores({
      sessions: '++id, createdAt',
    });
  }
}

export const db = new TabTamerDB();

export async function saveSession(session: SessionData): Promise<void> {
  await db.sessions.put(session);
}

export async function getSessions(): Promise<SessionData[]> {
  return db.sessions.orderBy('createdAt').reverse().toArray();
}

export async function getSession(id: string): Promise<SessionData | undefined> {
  return db.sessions.get(id);
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id);
}

// Working state for crash recovery (auto-save)
const WORKING_STATE_KEY = 'tabtamer_working_state';

export async function saveWorkingState(groups: TabGroupData[]): Promise<void> {
  try {
    localStorage.setItem(WORKING_STATE_KEY, JSON.stringify(groups));
  } catch (e) {
    console.error('Failed to save working state:', e);
  }
}

export async function loadWorkingState(): Promise<TabGroupData[] | null> {
  try {
    const data = localStorage.getItem(WORKING_STATE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load working state:', e);
  }
  return null;
}

export async function clearWorkingState(): Promise<void> {
  try {
    localStorage.removeItem(WORKING_STATE_KEY);
  } catch (e) {
    console.error('Failed to clear working state:', e);
  }
}

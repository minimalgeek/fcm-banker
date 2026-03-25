import type { GameState } from './types';

const STORAGE_KEY = 'fcm-banker-state';

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    // Strip pendingBatches on reload — timers are lost anyway
    return { ...parsed, pendingBatches: {} };
  } catch {
    return null;
  }
}

export function saveState(state: GameState): void {
  try {
    const serializable = { ...state, pendingBatches: {} };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedSave(state: GameState, delayMs = 500): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveState(state), delayMs);
}

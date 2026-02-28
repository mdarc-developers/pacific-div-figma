/**
 * Generic localStorage helpers shared across the app.
 * Each function is wrapped in try/catch to gracefully handle
 * storage quota errors (e.g. private-browsing mode).
 */

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silently ignore storage errors (e.g. private browsing quota)
  }
}

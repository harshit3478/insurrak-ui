const STALE_MS = 5 * 60 * 1000; // 5 minutes

export function isStale(lastFetched: number | null): boolean {
  if (lastFetched === null) return true;
  return Date.now() - lastFetched > STALE_MS;
}

// Module-level in-memory cache for pages that don't use Redux
const _store = new Map<string, { data: unknown; fetchedAt: number }>();

export function getClientCache<T>(key: string): T | null {
  const entry = _store.get(key);
  if (!entry || isStale(entry.fetchedAt)) return null;
  return entry.data as T;
}

export function setClientCache<T>(key: string, data: T): void {
  _store.set(key, { data, fetchedAt: Date.now() });
}

export function invalidateClientCache(key: string): void {
  _store.delete(key);
}

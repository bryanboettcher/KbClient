/**
 * Storage engine abstraction for state persistence
 *
 * Provides a common interface for state storage implementations
 * (in-memory, localStorage, sessionStorage, etc.)
 */
export interface StateStorageEngine {
  /**
   * Retrieve value by key
   * @param key Storage key
   * @returns Typed value or null if not found
   */
  get<T>(key: string): T | null;

  /**
   * Store value by key
   * @param key Storage key
   * @param value Value to store
   */
  set<T>(key: string, value: T): void;

  /**
   * Clear value by key
   * @param key Storage key
   */
  clear(key: string): void;
}

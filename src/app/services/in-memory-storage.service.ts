import { Injectable } from '@angular/core';
import { StateStorageEngine } from './state-storage.interface';

/**
 * In-memory implementation of state storage
 *
 * Injectable as root singleton - state persists across navigation
 * within a single application session but is cleared on page refresh.
 *
 * Use this for temporary UI state that should survive route navigation
 * but doesn't need to persist across browser sessions.
 */
@Injectable({
  providedIn: 'root'
})
export class InMemoryStorageService implements StateStorageEngine {
  private readonly storage = new Map<string, unknown>();

  /**
   * Retrieve value by key with type safety
   */
  get<T>(key: string): T | null {
    if (!this.storage.has(key)) {
      return null;
    }

    return this.storage.get(key) as T;
  }

  /**
   * Store value by key
   */
  set<T>(key: string, value: T): void {
    this.storage.set(key, value);
  }

  /**
   * Clear value by key
   */
  clear(key: string): void {
    this.storage.delete(key);
  }
}

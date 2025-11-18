import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { ProductQueryOptions } from '../models';
import { StateStorageEngine } from '../services/state-storage.interface';
import { InMemoryStorageService } from '../services/in-memory-storage.service';

/**
 * Internal state shape for product list
 */
interface ProductListState {
  page: number;
  size: number;
  search: string;
  status: 'enabled' | 'disabled' | null;
  sortBy: 'sku' | 'name' | 'quantity' | 'updatedOn';
  sortOrder: 'asc' | 'desc';
}

/**
 * Default state values
 */
const DEFAULT_STATE: ProductListState = {
  page: 0,
  size: 25,
  search: '',
  status: null,
  sortBy: 'sku',
  sortOrder: 'asc'
};

/**
 * Storage key for persistence
 */
const STORAGE_KEY = 'product-list-state';

/**
 * Signal-based reactive state store for product list
 *
 * Manages pagination, filtering, sorting, and search state with automatic
 * persistence to storage engine. All state is exposed as signals for reactive
 * component integration.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductStateStore {
  private readonly storage: StateStorageEngine = inject(InMemoryStorageService);

  // Signal-based state
  private readonly page = signal<number>(DEFAULT_STATE.page);
  private readonly size = signal<number>(DEFAULT_STATE.size);
  private readonly search = signal<string>(DEFAULT_STATE.search);
  private readonly status = signal<'enabled' | 'disabled' | null>(DEFAULT_STATE.status);
  private readonly sortBy = signal<'sku' | 'name' | 'quantity' | 'updatedOn'>(DEFAULT_STATE.sortBy);
  private readonly sortOrder = signal<'asc' | 'desc'>(DEFAULT_STATE.sortOrder);

  /**
   * Computed signal that combines all state into ProductQueryOptions
   * This matches the API contract expected by ProductService
   */
  readonly queryOptions = computed<ProductQueryOptions>(() => {
    const options: ProductQueryOptions = {
      page: this.page(),
      size: this.size(),
      sort: this.sortBy(),
      order: this.sortOrder()
    };

    // Only include optional fields if they have values
    const searchValue = this.search();
    if (searchValue) {
      options.search = searchValue;
    }

    const statusValue = this.status();
    if (statusValue) {
      options.status = statusValue;
    }

    return options;
  });

  constructor() {
    // Restore state from storage on initialization
    this.restoreState();

    // Persist state changes to storage
    effect(() => {
      const currentState: ProductListState = {
        page: this.page(),
        size: this.size(),
        search: this.search(),
        status: this.status(),
        sortBy: this.sortBy(),
        sortOrder: this.sortOrder()
      };

      this.storage.set(STORAGE_KEY, currentState);
    });
  }

  /**
   * Update status filter
   */
  updateFilters(status: 'enabled' | 'disabled' | null): void {
    this.status.set(status);
    // Reset to first page when filter changes
    this.page.set(0);
  }

  /**
   * Update sort configuration
   */
  updateSort(sortBy: 'sku' | 'name' | 'quantity' | 'updatedOn', sortOrder: 'asc' | 'desc'): void {
    this.sortBy.set(sortBy);
    this.sortOrder.set(sortOrder);
  }

  /**
   * Update pagination state
   */
  updatePagination(page: number, size?: number): void {
    this.page.set(page);
    if (size !== undefined) {
      this.size.set(size);
    }
  }

  /**
   * Update search query
   */
  updateSearch(query: string): void {
    this.search.set(query);
    // Reset to first page when search changes
    this.page.set(0);
  }

  /**
   * Reset all state to defaults
   */
  reset(): void {
    this.page.set(DEFAULT_STATE.page);
    this.size.set(DEFAULT_STATE.size);
    this.search.set(DEFAULT_STATE.search);
    this.status.set(DEFAULT_STATE.status);
    this.sortBy.set(DEFAULT_STATE.sortBy);
    this.sortOrder.set(DEFAULT_STATE.sortOrder);
  }

  /**
   * Restore state from storage
   */
  private restoreState(): void {
    const savedState = this.storage.get<ProductListState>(STORAGE_KEY);

    if (savedState) {
      this.page.set(savedState.page);
      this.size.set(savedState.size);
      this.search.set(savedState.search);
      this.status.set(savedState.status);
      this.sortBy.set(savedState.sortBy);
      this.sortOrder.set(savedState.sortOrder);
    }
  }
}

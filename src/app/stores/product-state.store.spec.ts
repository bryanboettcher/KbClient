import { TestBed } from '@angular/core/testing';
import { ProductStateStore } from './product-state.store';
import { InMemoryStorageService } from '../services/in-memory-storage.service';
import { ProductQueryOptions } from '../models';

describe('ProductStateStore', () => {
  let store: ProductStateStore;
  let storage: InMemoryStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductStateStore, InMemoryStorageService]
    });

    // Note: inject() must be called within injection context
    TestBed.runInInjectionContext(() => {
      store = TestBed.inject(ProductStateStore);
      storage = TestBed.inject(InMemoryStorageService);
    });
  });

  describe('initialization', () => {
    it('should create with default state', () => {
      const options = store.queryOptions();

      expect(options.page).toBe(0);
      expect(options.size).toBe(25);
      expect(options.sort).toBe('sku');
      expect(options.order).toBe('asc');
      expect(options.search).toBeUndefined();
      expect(options.status).toBeUndefined();
    });

    it('should restore state from storage', () => {
      const savedState = {
        page: 2,
        size: 50,
        search: 'test',
        status: 'enabled' as const,
        sortBy: 'name' as const,
        sortOrder: 'desc' as const
      };

      // Pre-populate storage
      storage.set('product-list-state', savedState);

      // Create new store instance with saved state
      TestBed.runInInjectionContext(() => {
        const newStore = new ProductStateStore();
        const options = newStore.queryOptions();

        expect(options.page).toBe(2);
        expect(options.size).toBe(50);
        expect(options.search).toBe('test');
        expect(options.status).toBe('enabled');
        expect(options.sort).toBe('name');
        expect(options.order).toBe('desc');
      });
    });
  });

  describe('updateFilters', () => {
    it('should update status filter to enabled', () => {
      store.updateFilters('enabled');
      const options = store.queryOptions();

      expect(options.status).toBe('enabled');
    });

    it('should update status filter to disabled', () => {
      store.updateFilters('disabled');
      const options = store.queryOptions();

      expect(options.status).toBe('disabled');
    });

    it('should clear status filter when set to null', () => {
      store.updateFilters('enabled');
      store.updateFilters(null);
      const options = store.queryOptions();

      expect(options.status).toBeUndefined();
    });

    it('should reset page to 0 when filter changes', () => {
      store.updatePagination(3);
      store.updateFilters('enabled');
      const options = store.queryOptions();

      expect(options.page).toBe(0);
    });

    it('should persist state to storage', () => {
      store.updateFilters('enabled');

      // Wait for effect to run
      TestBed.flushEffects();

      const savedState = storage.get<any>('product-list-state');
      expect(savedState).toEqual(
        expect.objectContaining({
          status: 'enabled',
          page: 0
        })
      );
    });
  });

  describe('updateSort', () => {
    it('should update sort column and order', () => {
      store.updateSort('name', 'desc');
      const options = store.queryOptions();

      expect(options.sort).toBe('name');
      expect(options.order).toBe('desc');
    });

    it('should handle ascending order', () => {
      store.updateSort('quantity', 'asc');
      const options = store.queryOptions();

      expect(options.sort).toBe('quantity');
      expect(options.order).toBe('asc');
    });

    it('should persist state to storage', () => {
      store.updateSort('updatedOn', 'desc');

      TestBed.flushEffects();

      const savedState = storage.get<any>('product-list-state');
      expect(savedState).toEqual(
        expect.objectContaining({
          sortBy: 'updatedOn',
          sortOrder: 'desc'
        })
      );
    });
  });

  describe('updatePagination', () => {
    it('should update page number', () => {
      store.updatePagination(5);
      const options = store.queryOptions();

      expect(options.page).toBe(5);
    });

    it('should update page and size when both provided', () => {
      store.updatePagination(2, 50);
      const options = store.queryOptions();

      expect(options.page).toBe(2);
      expect(options.size).toBe(50);
    });

    it('should only update page when size not provided', () => {
      store.updatePagination(3);
      const options = store.queryOptions();

      expect(options.page).toBe(3);
      expect(options.size).toBe(25); // Default
    });

    it('should persist state to storage', () => {
      store.updatePagination(4, 100);

      TestBed.flushEffects();

      const savedState = storage.get<any>('product-list-state');
      expect(savedState).toEqual(
        expect.objectContaining({
          page: 4,
          size: 100
        })
      );
    });
  });

  describe('updateSearch', () => {
    it('should update search query', () => {
      store.updateSearch('test query');
      const options = store.queryOptions();

      expect(options.search).toBe('test query');
    });

    it('should exclude search from options when empty string', () => {
      store.updateSearch('test');
      store.updateSearch('');
      const options = store.queryOptions();

      expect(options.search).toBeUndefined();
    });

    it('should reset page to 0 when search changes', () => {
      store.updatePagination(3);
      store.updateSearch('new search');
      const options = store.queryOptions();

      expect(options.page).toBe(0);
    });

    it('should persist state to storage', () => {
      store.updateSearch('search term');

      TestBed.flushEffects();

      const savedState = storage.get<any>('product-list-state');
      expect(savedState).toEqual(
        expect.objectContaining({
          search: 'search term',
          page: 0
        })
      );
    });
  });

  describe('reset', () => {
    it('should reset all state to defaults', () => {
      // Change all state
      store.updateFilters('enabled');
      store.updateSort('name', 'desc');
      store.updatePagination(5, 50);
      store.updateSearch('test');

      // Reset
      store.reset();

      const options = store.queryOptions();

      expect(options.page).toBe(0);
      expect(options.size).toBe(25);
      expect(options.sort).toBe('sku');
      expect(options.order).toBe('asc');
      expect(options.search).toBeUndefined();
      expect(options.status).toBeUndefined();
    });

    it('should persist reset state to storage', () => {
      store.updateFilters('enabled');
      store.reset();

      TestBed.flushEffects();

      const savedState = storage.get<any>('product-list-state');
      expect(savedState).toEqual({
        page: 0,
        size: 25,
        search: '',
        status: null,
        sortBy: 'sku',
        sortOrder: 'asc'
      });
    });
  });

  describe('computed queryOptions', () => {
    it('should reactively update when state changes', () => {
      const initialOptions = store.queryOptions();
      expect(initialOptions.page).toBe(0);

      store.updatePagination(2);

      const updatedOptions = store.queryOptions();
      expect(updatedOptions.page).toBe(2);
    });

    it('should only include optional fields when they have values', () => {
      const options: ProductQueryOptions = store.queryOptions();

      expect('search' in options).toBe(false);
      expect('status' in options).toBe(false);
      expect('page' in options).toBe(true);
      expect('size' in options).toBe(true);
      expect('sort' in options).toBe(true);
      expect('order' in options).toBe(true);
    });

    it('should include optional fields when set', () => {
      store.updateSearch('test');
      store.updateFilters('enabled');

      const options = store.queryOptions();

      expect(options.search).toBe('test');
      expect(options.status).toBe('enabled');
    });
  });

  describe('state persistence', () => {
    it('should persist state after multiple updates', () => {
      store.updateFilters('enabled');
      store.updateSort('name', 'desc');

      TestBed.flushEffects();

      // Verify complete state was persisted
      const savedState = storage.get<any>('product-list-state');
      expect(savedState).toEqual({
        page: 0, // Reset by filter change
        size: 25,
        search: '',
        status: 'enabled',
        sortBy: 'name',
        sortOrder: 'desc'
      });
    });
  });
});

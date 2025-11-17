import { ProductFilters } from './product-filters';
import { Product } from '../models';

describe('ProductFilters', () => {
  let mockProducts: Product[];

  beforeEach(() => {
    mockProducts = [
      {
        productId: '1',
        sku: 'MTR-X500',
        name: 'Brushless Motor X500',
        dimensions: { width: 2.5, length: 3.0, height: 1.5, weight: 0.3 },
        quantity: 45,
        inventoryId: 'inv-001',
        stockThreshold: 10,
        leadTime: '12:00:00',
        isStocked: true,
        isEnabled: true,
        isAvailable: true,
        createdOn: '2024-01-15T10:30:00.0000000Z',
        updatedOn: '2024-02-20T14:22:18.1234567Z'
      },
      {
        productId: '2',
        sku: 'PROP-A450',
        name: 'Carbon Fiber Propeller 4.5"',
        dimensions: { width: 4.5, length: 4.5, height: 0.2, weight: 0.05 },
        quantity: 120,
        inventoryId: 'inv-002',
        stockThreshold: 20,
        leadTime: '06:00:00',
        isStocked: true,
        isEnabled: true,
        isAvailable: true,
        createdOn: '2024-01-10T08:15:00.0000000Z',
        updatedOn: '2024-02-18T09:45:30.5678901Z'
      },
      {
        productId: '3',
        sku: 'ESC-PRO60',
        name: 'Electronic Speed Controller 60A',
        dimensions: { width: 1.8, length: 2.2, height: 0.8, weight: 0.15 },
        quantity: 8,
        inventoryId: 'inv-003',
        stockThreshold: 15,
        leadTime: '24:00:00',
        isStocked: true,
        isEnabled: true,
        isAvailable: false,
        createdOn: '2024-01-20T12:00:00.0000000Z',
        updatedOn: '2024-02-25T16:30:45.9876543Z'
      },
      {
        productId: '4',
        sku: 'BATT-3S2200',
        name: 'LiPo Battery 3S 2200mAh',
        dimensions: { width: 1.2, length: 4.0, height: 0.9, weight: 0.18 },
        quantity: 62,
        inventoryId: 'inv-004',
        stockThreshold: 25,
        leadTime: '18:00:00',
        isStocked: true,
        isEnabled: false,
        isAvailable: false,
        createdOn: '2024-01-05T14:45:00.0000000Z',
        updatedOn: '2024-02-22T11:10:20.2468135Z'
      },
      {
        productId: '5',
        sku: 'FRAME-250',
        name: 'Racing Frame 250mm',
        dimensions: { width: 10.0, length: 10.0, height: 2.5, weight: 0.45 },
        quantity: 35,
        inventoryId: 'inv-005',
        stockThreshold: 8,
        leadTime: '48:00:00',
        isStocked: true,
        isEnabled: false,
        isAvailable: false,
        createdOn: '2024-01-12T09:20:00.0000000Z',
        updatedOn: '2024-02-19T13:55:12.7531864Z'
      },
      {
        productId: '6',
        sku: 'CAM-HD720',
        name: 'FPV Camera 720p',
        dimensions: { width: 0.8, length: 1.2, height: 0.8, weight: 0.02 },
        quantity: 0,
        inventoryId: null,
        stockThreshold: null,
        leadTime: null,
        isStocked: false,
        isEnabled: false,
        isAvailable: false,
        createdOn: '2024-01-08T16:00:00.0000000Z',
        updatedOn: '2024-02-15T10:30:00.1357924Z'
      }
    ];
  });

  describe('apply', () => {
    it('should return all products when no filters applied', () => {
      const result = ProductFilters.apply(mockProducts, {});
      expect(result).toHaveLength(6);
      expect(result).not.toBe(mockProducts); // Should return a new array
    });

    it('should return empty array when no products provided', () => {
      const result = ProductFilters.apply([], {});
      expect(result).toHaveLength(0);
    });

    it('should throw error when products is null', () => {
      expect(() => ProductFilters.apply(null as any, {})).toThrow(
        'ProductFilters.apply: products parameter is null or undefined'
      );
    });

    it('should throw error when products is undefined', () => {
      expect(() => ProductFilters.apply(undefined as any, {})).toThrow(
        'ProductFilters.apply: products parameter is null or undefined'
      );
    });

    it('should throw error when products is not an array', () => {
      const invalidInput = { results: mockProducts } as any;
      expect(() => ProductFilters.apply(invalidInput, {})).toThrow(
        'ProductFilters.apply: products must be an array, received object'
      );
    });

    it('should throw error when products is a string', () => {
      expect(() => ProductFilters.apply('invalid' as any, {})).toThrow(
        'ProductFilters.apply: products must be an array, received string'
      );
    });

    it('should throw error when products is a number', () => {
      expect(() => ProductFilters.apply(42 as any, {})).toThrow(
        'ProductFilters.apply: products must be an array, received number'
      );
    });

    it('should throw error when products is a PaginatedResponse (common mistake)', () => {
      // This is the EXACT bug scenario: passing { results: [...] } instead of [...]
      const paginatedResponse = {
        totalItems: 2,
        page: 0,
        size: 25,
        results: mockProducts
      };
      expect(() => ProductFilters.apply(paginatedResponse as any, {})).toThrow(
        'ProductFilters.apply: products must be an array, received object'
      );
    });

    it('should handle array with invalid product objects gracefully', () => {
      // Products array contains malformed items (missing required properties)
      const invalidProducts = [
        { productId: '1', sku: 'TEST', name: null, quantity: 10, isEnabled: true, isStocked: true },
        {
          productId: '2',
          sku: 'OTHER',
          name: 'Valid Name',
          quantity: 20,
          isEnabled: false,
          isStocked: true
        }
      ] as any[];

      // Should not throw, should filter as best as possible
      const result = ProductFilters.apply(invalidProducts, { search: 'other' });
      expect(result).toHaveLength(1);
      expect(result[0].sku).toBe('OTHER');
    });

    it('should handle filters parameter when undefined', () => {
      // Edge case: if filters is undefined
      const result = ProductFilters.apply(mockProducts, undefined as any);
      // Should not throw, should return copy of all products
      expect(result).toHaveLength(6);
    });

    it('should handle filters parameter when null', () => {
      const result = ProductFilters.apply(mockProducts, null as any);
      expect(result).toHaveLength(6);
    });
  });

  describe('search filter', () => {
    it('should filter products by SKU (case-insensitive)', () => {
      const result = ProductFilters.apply(mockProducts, { search: 'mtr' });
      expect(result).toHaveLength(1);
      expect(result[0].sku).toBe('MTR-X500');
    });

    it('should filter products by name (case-insensitive)', () => {
      const result = ProductFilters.apply(mockProducts, { search: 'motor' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Brushless Motor X500');
    });

    it('should filter products by partial SKU match', () => {
      const result = ProductFilters.apply(mockProducts, { search: 'prop' });
      expect(result).toHaveLength(1);
      expect(result[0].sku).toBe('PROP-A450');
    });

    it('should filter products by partial name match', () => {
      const result = ProductFilters.apply(mockProducts, { search: 'battery' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toContain('Battery');
    });

    it('should return empty array when search term does not match', () => {
      const result = ProductFilters.apply(mockProducts, { search: 'nonexistent' });
      expect(result).toHaveLength(0);
    });

    it('should trim whitespace from search term', () => {
      const result = ProductFilters.apply(mockProducts, { search: '  motor  ' });
      expect(result).toHaveLength(1);
    });

    it('should handle empty search string', () => {
      const result = ProductFilters.apply(mockProducts, { search: '' });
      expect(result).toHaveLength(6);
    });

    it('should handle product with null name', () => {
      const productsWithNullName = [{ ...mockProducts[0], name: null }];
      const result = ProductFilters.apply(productsWithNullName, { search: 'motor' });
      expect(result).toHaveLength(0);
    });
  });

  describe('status filter', () => {
    it('should filter enabled products (isEnabled=true and isStocked=true)', () => {
      const result = ProductFilters.apply(mockProducts, { status: 'enabled' });
      expect(result).toHaveLength(3);
      result.forEach(p => {
        expect(p.isEnabled).toBe(true);
        expect(p.isStocked).toBe(true);
      });
    });

    it('should filter disabled products (isEnabled=false and isStocked=true)', () => {
      const result = ProductFilters.apply(mockProducts, { status: 'disabled' });
      expect(result).toHaveLength(2);
      result.forEach(p => {
        expect(p.isEnabled).toBe(false);
        expect(p.isStocked).toBe(true);
      });
    });

    it('should filter discontinued products (isStocked=false)', () => {
      const result = ProductFilters.apply(mockProducts, { status: 'discontinued' });
      expect(result).toHaveLength(1);
      expect(result[0].isStocked).toBe(false);
    });

    it('should return all products when status is null', () => {
      const result = ProductFilters.apply(mockProducts, { status: null });
      expect(result).toHaveLength(6);
    });
  });

  describe('sorting', () => {
    it('should sort by SKU ascending', () => {
      const result = ProductFilters.apply(mockProducts, { sortBy: 'sku', sortOrder: 'asc' });
      expect(result[0].sku).toBe('BATT-3S2200');
      expect(result[1].sku).toBe('CAM-HD720');
      expect(result[2].sku).toBe('ESC-PRO60');
      expect(result[5].sku).toBe('PROP-A450');
    });

    it('should sort by SKU descending', () => {
      const result = ProductFilters.apply(mockProducts, { sortBy: 'sku', sortOrder: 'desc' });
      expect(result[0].sku).toBe('PROP-A450');
      expect(result[1].sku).toBe('MTR-X500');
      expect(result[5].sku).toBe('BATT-3S2200');
    });

    it('should sort by name ascending', () => {
      const result = ProductFilters.apply(mockProducts, { sortBy: 'name', sortOrder: 'asc' });
      expect(result[0].name).toBe('Brushless Motor X500');
      expect(result[1].name).toBe('Carbon Fiber Propeller 4.5"');
    });

    it('should sort by name descending', () => {
      const result = ProductFilters.apply(mockProducts, { sortBy: 'name', sortOrder: 'desc' });
      expect(result[0].name).toBe('Racing Frame 250mm');
      expect(result[5].name).toBe('Brushless Motor X500');
    });

    it('should sort by quantity ascending', () => {
      const result = ProductFilters.apply(mockProducts, { sortBy: 'quantity', sortOrder: 'asc' });
      expect(result[0].quantity).toBe(0);
      expect(result[1].quantity).toBe(8);
      expect(result[5].quantity).toBe(120);
    });

    it('should sort by quantity descending', () => {
      const result = ProductFilters.apply(mockProducts, { sortBy: 'quantity', sortOrder: 'desc' });
      expect(result[0].quantity).toBe(120);
      expect(result[1].quantity).toBe(62);
      expect(result[5].quantity).toBe(0);
    });

    it('should sort by updatedOn ascending', () => {
      const result = ProductFilters.apply(mockProducts, { sortBy: 'updatedOn', sortOrder: 'asc' });
      // Earliest: 2024-02-15, Latest: 2024-02-25
      expect(result[0].productId).toBe('6'); // Feb 15
      expect(result[5].productId).toBe('3'); // Feb 25
    });

    it('should sort by updatedOn descending', () => {
      const result = ProductFilters.apply(mockProducts, { sortBy: 'updatedOn', sortOrder: 'desc' });
      expect(result[0].productId).toBe('3'); // Feb 25 (most recent)
      expect(result[5].productId).toBe('6'); // Feb 15 (oldest)
    });

    it('should default to ascending order when sortOrder not specified', () => {
      const result = ProductFilters.apply(mockProducts, { sortBy: 'quantity' });
      expect(result[0].quantity).toBe(0);
      expect(result[5].quantity).toBe(120);
    });

    it('should handle null name values when sorting by name', () => {
      const productsWithNullNames = [
        { ...mockProducts[0], name: null },
        { ...mockProducts[1], name: 'Zebra Product' }
      ];
      const result = ProductFilters.apply(productsWithNullNames, {
        sortBy: 'name',
        sortOrder: 'asc'
      });
      expect(result).toHaveLength(2);
      // Null/empty should come first
      expect(result[0].name).toBeNull();
    });
  });

  describe('combined filters', () => {
    it('should apply search and status filters together', () => {
      const result = ProductFilters.apply(mockProducts, {
        search: 'frame',
        status: 'disabled'
      });
      expect(result).toHaveLength(1);
      expect(result[0].sku).toBe('FRAME-250');
      expect(result[0].isEnabled).toBe(false);
    });

    it('should apply search and sorting together', () => {
      // Products with SKU containing letters (multiple matches)
      const result = ProductFilters.apply(mockProducts, {
        search: 'a',
        sortBy: 'sku',
        sortOrder: 'asc'
      });
      expect(result.length).toBeGreaterThan(0);
      // Verify sorted
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].sku.localeCompare(result[i].sku)).toBeLessThanOrEqual(0);
      }
    });

    it('should apply status and sorting together', () => {
      const result = ProductFilters.apply(mockProducts, {
        status: 'enabled',
        sortBy: 'quantity',
        sortOrder: 'desc'
      });
      expect(result).toHaveLength(3);
      expect(result[0].quantity).toBeGreaterThanOrEqual(result[1].quantity);
      result.forEach(p => expect(p.isEnabled).toBe(true));
    });

    it('should apply all filters together', () => {
      const result = ProductFilters.apply(mockProducts, {
        search: 'motor',
        status: 'enabled',
        sortBy: 'sku',
        sortOrder: 'asc'
      });
      expect(result).toHaveLength(1);
      expect(result[0].sku).toBe('MTR-X500');
      expect(result[0].isEnabled).toBe(true);
    });

    it('should return empty array when combined filters match nothing', () => {
      const result = ProductFilters.apply(mockProducts, {
        search: 'motor',
        status: 'discontinued'
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('immutability', () => {
    it('should not modify the original products array', () => {
      const original = [...mockProducts];
      ProductFilters.apply(mockProducts, { sortBy: 'quantity', sortOrder: 'desc' });
      expect(mockProducts).toEqual(original);
    });

    it('should not modify individual product objects', () => {
      const originalFirst = { ...mockProducts[0] };
      ProductFilters.apply(mockProducts, { search: 'motor' });
      expect(mockProducts[0]).toEqual(originalFirst);
    });
  });
});

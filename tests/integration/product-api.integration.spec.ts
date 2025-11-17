/**
 * Integration tests for Product API
 * Tests the actual json-server endpoints with real HTTP requests
 */

import {
  startTestServer,
  stopTestServer,
  resetTestData,
  waitForServerHealth
} from '../utils/test-server';
import { createHttpClient, HttpClient } from '../utils/http-client';

interface ProductDimensions {
  width: number;
  length: number;
  height: number;
  weight: number;
}

interface Product {
  id: string;
  productId: string;
  sku: string;
  name: string | null;
  dimensions: ProductDimensions | null;
  quantity: number;
  inventoryId: string | null;
  stockThreshold: number | null;
  leadTime: string | null;
  isStocked: boolean;
  isEnabled: boolean;
  isAvailable: boolean;
  createdOn: string;
  updatedOn: string;
}

interface PaginatedResponse<T> {
  totalItems: number;
  page: number;
  size: number;
  results: T[];
}

describe('Product API Integration Tests', () => {
  let baseUrl: string;
  let client: HttpClient;

  beforeAll(async () => {
    // Start the test server
    baseUrl = await startTestServer();
    await waitForServerHealth(baseUrl);
    client = createHttpClient(baseUrl);
  });

  afterAll(async () => {
    // Stop the test server
    await stopTestServer();
  });

  beforeEach(async () => {
    // Reset data to baseline before each test
    await resetTestData(baseUrl);
  });

  describe('GET /api/products', () => {
    it('should return paginated products with default pagination', async () => {
      const response = await client.get<PaginatedResponse<Product>>('/api/products');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalItems');
      expect(response.data).toHaveProperty('page');
      expect(response.data).toHaveProperty('size');
      expect(response.data).toHaveProperty('results');

      // Default pagination should be page 0, size 25
      expect(response.data.page).toBe(0);
      expect(response.data.size).toBe(25);
      expect(response.data.totalItems).toBeGreaterThan(0);
      expect(Array.isArray(response.data.results)).toBe(true);
    });

    it('should respect custom pagination parameters', async () => {
      const response = await client.get<PaginatedResponse<Product>>('/api/products?page=1&size=5');

      expect(response.ok).toBe(true);
      expect(response.data.page).toBe(1);
      expect(response.data.size).toBe(5);
      expect(response.data.results.length).toBeLessThanOrEqual(5);
    });

    it('should return products with correct shape', async () => {
      const response = await client.get<PaginatedResponse<Product>>('/api/products?page=0&size=1');

      expect(response.ok).toBe(true);
      expect(response.data.results.length).toBeGreaterThan(0);

      const product = response.data.results[0];

      // Verify product structure
      expect(product).toHaveProperty('productId');
      expect(product).toHaveProperty('sku');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('quantity');
      expect(product).toHaveProperty('isStocked');
      expect(product).toHaveProperty('isEnabled');
      expect(product).toHaveProperty('isAvailable');
      expect(product).toHaveProperty('createdOn');
      expect(product).toHaveProperty('updatedOn');

      // Verify types
      expect(typeof product.productId).toBe('string');
      expect(typeof product.sku).toBe('string');
      expect(typeof product.quantity).toBe('number');
      expect(typeof product.isStocked).toBe('boolean');

      // Verify productId is a valid UUID
      expect(product.productId).toBeValidUUID();
    });

    it('should have id field matching productId for json-server compatibility', async () => {
      const response = await client.get<PaginatedResponse<Product>>('/api/products?page=0&size=1');

      expect(response.ok).toBe(true);
      const product = response.data.results[0];

      // json-server needs 'id' field, which should match productId
      expect(product.id).toBe(product.productId);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by ID', async () => {
      // First get a product ID from the list
      const listResponse = await client.get<PaginatedResponse<Product>>(
        '/api/products?page=0&size=1'
      );
      const productId = listResponse.data.results[0].productId;

      // Then fetch that specific product
      const response = await client.get<Product>(`/api/products/${productId}`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data.productId).toBe(productId);
      expect(response.data.id).toBe(productId);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await client.get<unknown>('/api/products/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        productId: '550e8400-e29b-41d4-a716-446655440099',
        id: '550e8400-e29b-41d4-a716-446655440099',
        sku: 'TEST-PRODUCT-001',
        name: 'Test Product',
        dimensions: {
          width: 100,
          length: 100,
          height: 50,
          weight: 500
        },
        quantity: 10,
        inventoryId: 'inv-test',
        stockThreshold: 5,
        leadTime: '48:00:00',
        isStocked: true,
        isEnabled: true,
        isAvailable: true,
        createdOn: '2025-11-17T00:00:00.0000000Z',
        updatedOn: '2025-11-17T00:00:00.0000000Z'
      };

      const response = await client.post<Product>('/api/products', newProduct);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(response.data.sku).toBe('TEST-PRODUCT-001');
      expect(response.data.name).toBe('Test Product');

      // Verify it was actually created
      const verifyResponse = await client.get<Product>(`/api/products/${newProduct.productId}`);
      expect(verifyResponse.ok).toBe(true);
      expect(verifyResponse.data.sku).toBe('TEST-PRODUCT-001');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update an existing product', async () => {
      // Get an existing product
      const listResponse = await client.get<PaginatedResponse<Product>>(
        '/api/products?page=0&size=1'
      );
      const product = listResponse.data.results[0];

      // Update the product
      const updatedProduct = {
        ...product,
        name: 'Updated Product Name',
        quantity: 999
      };

      const response = await client.put<Product>(`/api/products/${product.id}`, updatedProduct);

      expect(response.ok).toBe(true);
      expect(response.data.name).toBe('Updated Product Name');
      expect(response.data.quantity).toBe(999);

      // Verify the update persisted
      const verifyResponse = await client.get<Product>(`/api/products/${product.id}`);
      expect(verifyResponse.data.name).toBe('Updated Product Name');
      expect(verifyResponse.data.quantity).toBe(999);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      // Get an existing product
      const listResponse = await client.get<PaginatedResponse<Product>>(
        '/api/products?page=0&size=1'
      );
      const product = listResponse.data.results[0];

      // Delete the product
      const deleteResponse = await client.delete(`/api/products/${product.id}`);
      expect(deleteResponse.ok).toBe(true);

      // Verify it was deleted
      const verifyResponse = await client.get(`/api/products/${product.id}`);
      expect(verifyResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent product', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await client.delete(`/api/products/${nonExistentId}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Product actions', () => {
    it('should enable a disabled product via POST /api/products/:id/enable', async () => {
      // Find a disabled product
      const disabledResponse = await client.get<PaginatedResponse<Product>>(
        '/api/products?status=disabled&size=1'
      );
      expect(disabledResponse.data.results.length).toBeGreaterThan(0);
      const disabledProduct = disabledResponse.data.results[0];
      expect(disabledProduct.isEnabled).toBe(false);

      // POST to enable
      const enableResponse = await client.post<Product>(
        `/api/products/${disabledProduct.productId}/enable`
      );

      expect(enableResponse.ok).toBe(true);
      expect(enableResponse.status).toBe(200);

      // Verify isEnabled changed to true
      expect(enableResponse.data.isEnabled).toBe(true);

      // Verify response is the full product object
      expect(enableResponse.data.productId).toBe(disabledProduct.productId);
      expect(enableResponse.data.sku).toBe(disabledProduct.sku);

      // GET the product to confirm persistence
      const verifyResponse = await client.get<Product>(
        `/api/products/${disabledProduct.productId}`
      );
      expect(verifyResponse.data.isEnabled).toBe(true);
    });

    it('should disable an enabled product via POST /api/products/:id/disable', async () => {
      // Find an enabled product
      const enabledResponse = await client.get<PaginatedResponse<Product>>(
        '/api/products?status=enabled&size=1'
      );
      expect(enabledResponse.data.results.length).toBeGreaterThan(0);
      const enabledProduct = enabledResponse.data.results[0];
      expect(enabledProduct.isEnabled).toBe(true);

      // POST to disable
      const disableResponse = await client.post<Product>(
        `/api/products/${enabledProduct.productId}/disable`
      );

      expect(disableResponse.ok).toBe(true);
      expect(disableResponse.status).toBe(200);

      // Verify isEnabled changed to false
      expect(disableResponse.data.isEnabled).toBe(false);

      // Verify response is the full product object
      expect(disableResponse.data.productId).toBe(enabledProduct.productId);
      expect(disableResponse.data.sku).toBe(enabledProduct.sku);

      // GET the product to confirm persistence
      const verifyResponse = await client.get<Product>(`/api/products/${enabledProduct.productId}`);
      expect(verifyResponse.data.isEnabled).toBe(false);
    });

    it('should enable a product via PATCH (RESTful)', async () => {
      // Find a disabled product
      const disabledResponse = await client.get<PaginatedResponse<Product>>(
        '/api/products?status=disabled&size=1'
      );
      expect(disabledResponse.data.results.length).toBeGreaterThan(0);
      const disabledProduct = disabledResponse.data.results[0];
      expect(disabledProduct.isEnabled).toBe(false);

      // PATCH /api/products/:id with { "isEnabled": true }
      const patchResponse = await client.patch<Product>(
        `/api/products/${disabledProduct.productId}`,
        { isEnabled: true }
      );

      expect(patchResponse.ok).toBe(true);
      expect(patchResponse.status).toBe(200);

      // Verify the update worked
      expect(patchResponse.data.isEnabled).toBe(true);
      expect(patchResponse.data.productId).toBe(disabledProduct.productId);

      // Verify persistence
      const verifyResponse = await client.get<Product>(
        `/api/products/${disabledProduct.productId}`
      );
      expect(verifyResponse.data.isEnabled).toBe(true);
    });

    it('should return 404 when enabling non-existent product', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      // POST to non-existent id
      const response = await client.post<{ error: string }>(
        `/api/products/${nonExistentId}/enable`
      );

      // Verify 404 status
      expect(response.status).toBe(404);
      expect(response.data.error).toBe('Product not found');
    });

    it('should return 404 when disabling non-existent product', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      // POST to non-existent id
      const response = await client.post<{ error: string }>(
        `/api/products/${nonExistentId}/disable`
      );

      // Verify 404 status
      expect(response.status).toBe(404);
      expect(response.data.error).toBe('Product not found');
    });

    it('should be idempotent when enabling already enabled product', async () => {
      // Find an enabled product
      const enabledResponse = await client.get<PaginatedResponse<Product>>(
        '/api/products?status=enabled&size=1'
      );
      const enabledProduct = enabledResponse.data.results[0];

      // Enable it again
      const response = await client.post<Product>(
        `/api/products/${enabledProduct.productId}/enable`
      );

      expect(response.ok).toBe(true);
      expect(response.data.isEnabled).toBe(true);
    });

    it('should be idempotent when disabling already disabled product', async () => {
      // Find a disabled product
      const disabledResponse = await client.get<PaginatedResponse<Product>>(
        '/api/products?status=disabled&size=1'
      );
      const disabledProduct = disabledResponse.data.results[0];

      // Disable it again
      const response = await client.post<Product>(
        `/api/products/${disabledProduct.productId}/disable`
      );

      expect(response.ok).toBe(true);
      expect(response.data.isEnabled).toBe(false);
    });
  });

  describe('Reset endpoint', () => {
    it('should restore data after modifications', async () => {
      // Get initial count
      const initialResponse = await client.get<PaginatedResponse<Product>>('/api/products');
      const initialCount = initialResponse.data.totalItems;

      // Delete a product
      const product = initialResponse.data.results[0];
      await client.delete(`/api/products/${product.id}`);

      // Verify deletion
      const afterDeleteResponse = await client.get<PaginatedResponse<Product>>('/api/products');
      expect(afterDeleteResponse.data.totalItems).toBe(initialCount - 1);

      // Reset data
      await resetTestData(baseUrl);

      // Verify restoration
      const afterResetResponse = await client.get<PaginatedResponse<Product>>('/api/products');
      expect(afterResetResponse.data.totalItems).toBe(initialCount);

      // Verify the deleted product is back
      const restoredProduct = await client.get<Product>(`/api/products/${product.id}`);
      expect(restoredProduct.ok).toBe(true);
      expect(restoredProduct.data.productId).toBe(product.productId);
    });
  });

  describe('Server-side filtering', () => {
    it('should filter products by search term', async () => {
      // Search for "PLA" - should match products with PLA in name or sku
      const response = await client.get<PaginatedResponse<Product>>(
        '/api/products?search=PLA&size=100'
      );

      expect(response.ok).toBe(true);
      expect(response.data.results.length).toBeGreaterThan(0);

      // All results should contain "PLA" in name or sku (case-insensitive)
      response.data.results.forEach(product => {
        const nameContainsPla = product.name?.toLowerCase().includes('pla') ?? false;
        const skuContainsPla = product.sku.toLowerCase().includes('pla');
        expect(nameContainsPla || skuContainsPla).toBe(true);
      });

      // Verify specific match - "PLA Filament Black 1kg" should be in results
      const plaBlack = response.data.results.find(p => p.sku === 'PLA-BLK-1KG');
      expect(plaBlack).toBeDefined();
      expect(plaBlack?.name).toBe('PLA Filament Black 1kg');
    });

    it('should filter by enabled status', async () => {
      const response = await client.get<PaginatedResponse<Product>>(
        '/api/products?status=enabled&size=100'
      );

      expect(response.ok).toBe(true);
      expect(response.data.results.length).toBeGreaterThan(0);

      // All results should have isEnabled=true
      response.data.results.forEach(product => {
        expect(product.isEnabled).toBe(true);
      });

      // Verify that disabled products are not included
      const disabledProduct = response.data.results.find(p => p.sku === 'TPU-FLEX-BLK-500G');
      expect(disabledProduct).toBeUndefined();
    });

    it('should filter by disabled status', async () => {
      const response = await client.get<PaginatedResponse<Product>>(
        '/api/products?status=disabled&size=100'
      );

      expect(response.ok).toBe(true);
      expect(response.data.results.length).toBeGreaterThan(0);

      // All results should have isEnabled=false
      response.data.results.forEach(product => {
        expect(product.isEnabled).toBe(false);
      });

      // Verify known disabled products are included
      const disabledSkus = response.data.results.map(p => p.sku);
      // TPU-FLEX-BLK-500G and DISCONTINUED-001 should be disabled
      expect(disabledSkus).toContain('TPU-FLEX-BLK-500G');
      expect(disabledSkus).toContain('DISCONTINUED-001');
    });

    it('should sort by name ascending', async () => {
      const response = await client.get<PaginatedResponse<Product>>(
        '/api/products?sort=name&order=asc&size=100'
      );

      expect(response.ok).toBe(true);
      expect(response.data.results.length).toBeGreaterThan(1);

      // Verify alphabetical order (ignoring nulls which sort to end)
      const names = response.data.results
        .map(p => p.name)
        .filter(name => name !== null) as string[];

      for (let i = 1; i < names.length; i++) {
        const comparison = names[i - 1].localeCompare(names[i]);
        expect(comparison).toBeLessThanOrEqual(0);
      }

      // First non-null name should be alphabetically first
      // Based on data: "40x40x10mm Quiet Fan 12V" or "ABS Filament Red 1kg"
      expect(names[0].startsWith('4') || names[0].startsWith('A')).toBe(true);
    });

    it('should sort by quantity descending', async () => {
      const response = await client.get<PaginatedResponse<Product>>(
        '/api/products?sort=quantity&order=desc&size=100'
      );

      expect(response.ok).toBe(true);
      expect(response.data.results.length).toBeGreaterThan(1);

      // Verify highest quantity first
      const quantities = response.data.results.map(p => p.quantity);

      for (let i = 1; i < quantities.length; i++) {
        expect(quantities[i - 1]).toBeGreaterThanOrEqual(quantities[i]);
      }

      // Highest quantity in test data is 150 (THERMISTOR-NTC100K)
      expect(quantities[0]).toBe(150);
    });

    it('should combine search, status, and sort filters', async () => {
      // Search for "Nozzle", enabled only, sorted by name descending
      const response = await client.get<PaginatedResponse<Product>>(
        '/api/products?search=nozzle&status=enabled&sort=name&order=desc&size=100'
      );

      expect(response.ok).toBe(true);
      expect(response.data.results.length).toBeGreaterThan(0);

      // All results should:
      // 1. Contain "nozzle" in name or sku (case-insensitive)
      // 2. Have isEnabled=true
      // 3. Be sorted by name descending
      response.data.results.forEach(product => {
        const nameContainsNozzle = product.name?.toLowerCase().includes('nozzle') ?? false;
        const skuContainsNozzle = product.sku.toLowerCase().includes('nozzle');
        expect(nameContainsNozzle || skuContainsNozzle).toBe(true);
        expect(product.isEnabled).toBe(true);
      });

      // Verify descending order
      const names = response.data.results
        .map(p => p.name)
        .filter(name => name !== null) as string[];

      for (let i = 1; i < names.length; i++) {
        const comparison = names[i - 1].localeCompare(names[i]);
        expect(comparison).toBeGreaterThanOrEqual(0); // Descending order
      }

      // Disabled nozzle (NOZZLE-HARDENED-08MM with isEnabled=true but different status check needed)
      // Actually all NOZZLE products in test data have isEnabled=true except none, so test the filter works
      const disabledProducts = response.data.results.filter(p => !p.isEnabled);
      expect(disabledProducts.length).toBe(0);
    });

    it('should return correct totalItems for filtered results', async () => {
      // Get total count of all products
      const allResponse = await client.get<PaginatedResponse<Product>>('/api/products?size=100');
      const totalCount = allResponse.data.totalItems;

      // Get count of enabled products only
      const enabledResponse = await client.get<PaginatedResponse<Product>>(
        '/api/products?status=enabled&size=100'
      );
      const enabledCount = enabledResponse.data.totalItems;

      // Get count of disabled products only
      const disabledResponse = await client.get<PaginatedResponse<Product>>(
        '/api/products?status=disabled&size=100'
      );
      const disabledCount = disabledResponse.data.totalItems;

      // totalItems should reflect filtered count, not total DB
      expect(enabledCount).toBeLessThan(totalCount);
      expect(disabledCount).toBeLessThan(totalCount);
      expect(enabledCount + disabledCount).toBe(totalCount);

      // Verify totalItems matches actual results length when all fit in one page
      expect(enabledResponse.data.totalItems).toBe(enabledResponse.data.results.length);
      expect(disabledResponse.data.totalItems).toBe(disabledResponse.data.results.length);

      // Test with search filter
      const searchResponse = await client.get<PaginatedResponse<Product>>(
        '/api/products?search=PLA&size=100'
      );
      expect(searchResponse.data.totalItems).toBe(searchResponse.data.results.length);
      expect(searchResponse.data.totalItems).toBeLessThan(totalCount);
    });

    it('should handle search with no results', async () => {
      const response = await client.get<PaginatedResponse<Product>>(
        '/api/products?search=NONEXISTENT123'
      );

      expect(response.ok).toBe(true);
      expect(response.data.results.length).toBe(0);
      expect(response.data.totalItems).toBe(0);
    });

    it('should maintain pagination with filters', async () => {
      // Get first page of enabled products with small page size
      const page0Response = await client.get<PaginatedResponse<Product>>(
        '/api/products?status=enabled&page=0&size=5'
      );

      expect(page0Response.ok).toBe(true);
      expect(page0Response.data.page).toBe(0);
      expect(page0Response.data.size).toBe(5);
      expect(page0Response.data.results.length).toBe(5);
      expect(page0Response.data.totalItems).toBeGreaterThan(5);

      // Get second page
      const page1Response = await client.get<PaginatedResponse<Product>>(
        '/api/products?status=enabled&page=1&size=5'
      );

      expect(page1Response.ok).toBe(true);
      expect(page1Response.data.page).toBe(1);
      expect(page1Response.data.results.length).toBeLessThanOrEqual(5);

      // Ensure no overlap between pages
      const page0Ids = page0Response.data.results.map(p => p.productId);
      const page1Ids = page1Response.data.results.map(p => p.productId);
      const overlap = page0Ids.filter(id => page1Ids.includes(id));
      expect(overlap.length).toBe(0);

      // Total items should be consistent across pages
      expect(page0Response.data.totalItems).toBe(page1Response.data.totalItems);
    });
  });
});

# Integration Tests

This directory contains integration tests that test multi-component workflows with a fake backend using Mock Service Worker (MSW).

## Current Status

The integration tests are set up and ready to use, but MSW 2.x requires several browser APIs that are not available in the Jest (Node.js) test environment:

- `MessageChannel`
- `BroadcastChannel`
- `TextEncoder`/`TextDecoder`
- `fetch` API
- `Response` / `Request` objects

## Running Integration Tests

### Option 1: Use MSW 1.x (Recommended for Node.js)

Downgrade to MSW 1.x which has better Node.js support:

```bash
npm install --save-dev msw@1.3.2
```

Then update `tests/setup/handlers.ts` to use MSW 1.x syntax if needed.

### Option 2: Use Happy DOM or JSDOM with Full Polyfills

Install additional polyfills for MSW 2.x:

```bash
npm install --save-dev node-fetch undici
```

Then configure Jest to use a more complete browser environment.

### Option 3: Run Integration Tests in a Real Browser

Use a tool like Playwright or Cypress for integration testing that runs in a real browser environment.

## Test Structure

Integration tests follow the Given/When/Then pattern:

```typescript
it('should create product and verify it appears in list', (done) => {
  // Given: User wants to create a product
  const newProduct = { name: 'RC Motor X500', sku: 'MTR-X500' };

  // When: Product is created and list is fetched
  productService.createProduct(newProduct).subscribe(() => {
    productService.getProducts().subscribe(products => {
      // Then: Product appears in the list
      expect(products.find(p => p.sku === 'MTR-X500')).toBeDefined();
      done();
    });
  });
});
```

## MSW Handlers

The MSW handlers in `tests/setup/handlers.ts` provide a fake REST API with in-memory data stores:

- Products CRUD operations
- Inventory management
- Enable/disable product workflows

Handlers are reset after each test to ensure test isolation.

## Future Improvements

Consider:
- Migrating to MSW 1.x for better Node.js compatibility
- Using a real browser environment for integration tests
- Splitting into API contract tests (MSW) and component integration tests (Testing Library)

For now, focus on unit tests (`src/**/*.spec.ts`) which work correctly.

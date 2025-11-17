/**
 * Setup file for integration tests
 * Runs before each test file
 */

// Ensure fetch is available in Node environment
// Node 18+ has native fetch, but we ensure it's available
if (typeof global.fetch === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('whatwg-fetch');
}

// Increase Jest's default timeout for integration tests
jest.setTimeout(30000);

// Add custom matchers for integration tests if needed
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid UUID`
          : `expected ${received} to be a valid UUID`
    };
  }
});

// Type augmentation for custom matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
    }
  }
}

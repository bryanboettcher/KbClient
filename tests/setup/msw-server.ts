import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for integration tests
 * Intercepts HTTP requests and returns mock responses
 */
export const server = setupServer(...handlers);

/**
 * Setup for integration tests
 */
beforeAll(() => {
  // Enable API mocking before all tests
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  // Reset handlers after each test to prevent test pollution
  server.resetHandlers();
});

afterAll(() => {
  // Clean up after all tests
  server.close();
});

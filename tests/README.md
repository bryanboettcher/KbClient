# Tests

This directory contains unit tests for the application.

## Unit Tests

Unit tests are located throughout the codebase following the pattern `**/*.spec.ts`.

## Mocking Backend

The project uses `json-server` as the mock backend for both development and testing. This provides a single, consistent mock API across all environments.

Run json-server with:
```bash
npm run server
```

The mock API server runs at `http://localhost:5000/api` and serves data from `db.json`.

## Test Execution

Run all tests with:
```bash
npm test
```

Run tests in watch mode with:
```bash
npm run test:watch
```

Generate coverage report with:
```bash
npm run test:coverage
```

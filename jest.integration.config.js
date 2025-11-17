/**
 * Jest configuration for integration tests
 * Extends base Jest config with integration-specific settings
 */

const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,

  // Override test patterns for integration tests
  testMatch: [
    '<rootDir>/tests/integration/**/*.integration.spec.ts'
  ],

  // Longer timeouts for HTTP requests
  testTimeout: 30000, // 30 seconds per test

  // Setup file for integration tests (Node environment needs)
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/integration-setup.ts'
  ],

  // Use Node environment instead of jsdom for integration tests
  testEnvironment: 'node',

  // Coverage configuration specific to integration tests
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/node_modules/**'
  ],
  coverageDirectory: 'coverage/integration',

  // Disable coverage thresholds for integration tests
  coverageThreshold: undefined,

  // Module resolution - keep path aliases for shared types
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@test-utils/(.*)$': '<rootDir>/tests/utils/$1'
  },

  // Transform configuration for TypeScript in tests directory
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ]
  },

  // Don't need Angular-specific preprocessing
  preset: undefined
};

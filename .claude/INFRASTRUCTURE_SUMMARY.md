# Infrastructure Configuration Summary

## Overview

This document summarizes the testing infrastructure, structured logging, and Docker deployment configuration for the KbStore Admin Angular application.

## 1. Testing Infrastructure

### Jest Configuration

**Replaced Karma/Jasmine with Jest** for better performance and developer experience.

**Key files:**
- `jest.config.js` - Main Jest configuration
- `setup-jest.ts` - Test environment setup with Angular testing module initialization
- `tsconfig.spec.json` - TypeScript configuration for tests

**Features:**
- Pure logic unit tests (no DOM rendering)
- Path aliases matching `tsconfig.json`
- 80% minimum coverage threshold (configurable)
- Separate test patterns for unit tests (`.spec.ts`) and integration tests (`/tests`)

**Commands:**
```bash
npm test              # Run unit tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### Mock Service Worker (MSW)

**Setup for integration tests** with fake backend API.

**Key files:**
- `tests/setup/msw-server.ts` - MSW server configuration
- `tests/setup/handlers.ts` - HTTP request handlers based on API contract
- `tests/README.md` - Integration test documentation

**Status:**
- MSW handlers are configured and ready
- Integration test example provided
- **Note:** MSW 2.x requires browser polyfills not available in Node.js Jest environment
- Unit tests work perfectly; integration tests require additional setup (see `tests/README.md`)

**In-memory data stores:**
- Products (CRUD operations)
- Inventory (basic operations)
- Handlers reset after each test for isolation

### Pre-commit Hooks

**Husky + lint-staged** automatically run quality checks on commit.

**Key files:**
- `.husky/pre-commit` - Runs lint-staged
- `.husky/commit-msg` - Validates commit messages
- `.lintstagedrc.json` - Lint-staged configuration
- `commitlint.config.js` - Conventional commits enforcement
- `.prettierrc.json` - Code formatting rules

**What runs on commit:**
- Related tests for changed files (`jest --findRelatedTests`)
- Prettier formatting for `.ts`, `.html`, `.scss`, `.json`
- Commit message validation (conventional commits format)

**Conventional commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Build/tooling changes
- `style:` - Code style changes
- `perf:` - Performance improvements

### Test Examples

**Unit test example:** `/src/app/services/product.service.spec.ts`
- Tests ProductService methods
- Mocked HttpClient and NGXLogger
- 100% code coverage for the service
- 8 passing tests covering all CRUD operations

**Integration test example:** `/tests/product-management/create-product.integration.spec.ts`
- Tests product creation workflow
- Uses MSW fake backend
- Given/When/Then structure
- (Requires polyfill setup to run)

## 2. Structured Logging

### NGX-Logger Configuration

**Installed and configured** for environment-specific logging levels.

**Key files:**
- `src/app/app.config.ts` - Logger provider configuration
- `src/app/services/api.service.ts` - Example usage in error handling

**Configuration:**
- **Development:** DEBUG level, full console logging, colorized output
- **Production:** ERROR level only, minimal logging
- **Server logging:** OFF (can be enabled by configuring endpoint)

**Log levels:**
- TRACE, DEBUG, INFO, LOG, WARN, ERROR, FATAL, OFF

**Usage example:**
```typescript
constructor(private logger: NGXLogger) {}

this.logger.debug('Fetching products from API...');
this.logger.error('Failed to create product:', error);
this.logger.info('Product created successfully', productId);
```

**Color scheme:**
- DEBUG: Purple
- INFO: Teal
- WARN: Gray
- ERROR: Red

## 3. Docker Deployment

### Multi-stage Dockerfile

**Optimized production build** with nginx serving static files.

**Key files:**
- `Dockerfile` - Multi-stage build configuration
- `nginx.conf` - Nginx server configuration
- `docker-entrypoint.sh` - Runtime environment injection script
- `docker-compose.yml` - Docker Compose service definition
- `build.sh` - Convenient build script

**Build stages:**
1. **Build stage (node:20-alpine):**
   - Installs dependencies with `npm ci`
   - Builds Angular app with production optimization
   - Output: `/dist/kbstore-admin/browser`

2. **Runtime stage (nginx:alpine):**
   - Copies built Angular app
   - Copies custom nginx configuration
   - Copies entrypoint script for env injection
   - Exposes port 80

**Image size:** Minimal (nginx:alpine ~50MB + Angular app ~5-10MB)

### Runtime Environment Injection

**Environment variables injected at container startup** (not build time).

**How it works:**
1. Docker entrypoint script (`docker-entrypoint.sh`) runs on container start
2. Script generates `/usr/share/nginx/html/assets/env.js` with environment variables
3. `index.html` loads `env.js` before Angular app
4. Angular environment files read from `window.env` with fallback to compile-time values

**Supported environment variables:**
- `API_URL` - Backend API endpoint (default: `http://localhost:5000/api`)

**Example:**
```bash
docker run -p 8080:80 -e API_URL=http://my-backend:5000/api kbstore-admin:latest
```

**Key files:**
- `src/assets/env.js` - Default environment config (overwritten by Docker)
- `src/app/environments/environment.ts` - Reads from `window.env`
- `src/app/environments/environment.prod.ts` - Reads from `window.env`
- `src/index.html` - Loads `env.js`

### Nginx Configuration

**Optimized for Angular SPA** with caching, compression, and security.

**Features:**
- **SPA routing:** Fallback to `index.html` for all routes
- **Gzip compression:** For text assets (JS, CSS, HTML, JSON, SVG)
- **Cache headers:**
  - Static assets (JS, CSS, images): 1 year immutable
  - `index.html`: No cache (always fresh)
- **Security headers:**
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
- **Health check:** `/health` endpoint returns 200

### Docker Commands

**Build image:**
```bash
./build.sh
# OR
docker build -t kbstore-admin:latest .
```

**Run with docker-compose:**
```bash
docker-compose up
```

**Run standalone:**
```bash
docker run -p 8080:80 kbstore-admin:latest
```

**Run with custom API URL:**
```bash
docker run -p 8080:80 -e API_URL=http://your-api:5000/api kbstore-admin:latest
```

**Access application:**
- http://localhost:8080

## 4. Development Workflow

### Local Development

```bash
npm install          # Install dependencies
npm start            # Start dev server (http://localhost:4200)
npm test             # Run unit tests
npm run test:watch   # Test watch mode
```

**Environment:** Uses `src/app/environments/environment.ts` with `http://localhost:5000/api`

### Docker Development

```bash
./build.sh                  # Build Docker image
docker-compose up           # Run container
```

**Environment:** Uses runtime injection from `docker-compose.yml`

### Quality Gates

**Pre-commit (automatic via Husky):**
- Related tests must pass
- Code must be formatted (Prettier)
- Commit message must follow conventional commits

**CI Pipeline (future):**
- All unit tests must pass
- Code coverage must meet 80% threshold
- Production build must succeed
- Docker image must build successfully

## 5. File Structure

```
/mnt/c/Users/bryan/source/bryanboettcher/KbClient/
├── .claude/
│   ├── TESTING_SPEC.md              # Testing philosophy and guidelines
│   └── INFRASTRUCTURE_SUMMARY.md    # This file
├── .husky/
│   ├── pre-commit                   # Runs lint-staged
│   └── commit-msg                   # Validates commit messages
├── src/
│   ├── app/
│   │   ├── services/
│   │   │   ├── product.service.ts
│   │   │   └── product.service.spec.ts   # Unit test example
│   │   ├── environments/
│   │   │   ├── environment.ts            # Dev config with window.env support
│   │   │   └── environment.prod.ts       # Prod config with window.env support
│   │   └── app.config.ts                 # NGX-Logger configuration
│   ├── assets/
│   │   └── env.js                        # Runtime environment (Docker injects)
│   └── index.html                        # Loads env.js
├── tests/
│   ├── setup/
│   │   ├── msw-server.ts                 # MSW server setup
│   │   └── handlers.ts                   # MSW request handlers
│   ├── product-management/
│   │   └── create-product.integration.spec.ts  # Integration test example
│   └── README.md                         # Integration test setup notes
├── jest.config.js                        # Jest configuration
├── setup-jest.ts                         # Jest setup with Angular testing
├── tsconfig.spec.json                    # TypeScript config for tests
├── .lintstagedrc.json                    # Lint-staged configuration
├── .prettierrc.json                      # Prettier configuration
├── commitlint.config.js                  # Commit message rules
├── Dockerfile                            # Multi-stage Docker build
├── docker-compose.yml                    # Docker Compose service
├── docker-entrypoint.sh                  # Runtime env injection
├── nginx.conf                            # Nginx SPA configuration
├── build.sh                              # Build helper script
└── README.md                             # Updated with testing and Docker docs
```

## 6. Key Dependencies Added

**Testing:**
- `jest` - Test framework
- `jest-preset-angular` - Angular preset for Jest
- `@testing-library/angular` - Component testing utilities
- `@testing-library/jest-dom` - DOM matchers
- `jest-environment-jsdom` - Browser-like environment
- `msw` - Mock Service Worker for API mocking
- `@types/jest` - TypeScript types

**Code Quality:**
- `husky` - Git hooks
- `lint-staged` - Run tasks on staged files
- `prettier` - Code formatter
- `@commitlint/cli` - Commit message linter
- `@commitlint/config-conventional` - Conventional commits rules

**Logging:**
- `ngx-logger` - Structured logging for Angular

**Development:**
- `whatwg-fetch` - Fetch polyfill
- `broadcastchannel-polyfill` - BroadcastChannel polyfill (for MSW)

## 7. Configuration Highlights

### Jest Coverage Thresholds

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### Path Aliases (Shared between Jest and TypeScript)

```javascript
'@app/*': ['src/app/*']
'@environments/*': ['src/app/environments/*']
'@models/*': ['src/app/models/*']
'@services/*': ['src/app/services/*']
'@components/*': ['src/app/components/*']
'@features/*': ['src/app/features/*']
```

### Environment Configuration Pattern

```typescript
// Compile-time fallback with runtime override from Docker
export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' && window.env?.apiUrl)
    || 'https://api.kbstore.com/api'
};
```

## 8. Known Issues and Future Work

### Known Issues

1. **MSW 2.x integration tests:** Require additional browser polyfills for Node.js environment
   - **Workaround:** Focus on unit tests; see `tests/README.md` for MSW setup options
   - **Alternative:** Downgrade to MSW 1.x or use Playwright for browser-based tests

2. **TypeScript warnings:** `isolatedModules` and `emitDecoratorMetadata` conflict
   - **Impact:** Warnings only, no functional issues
   - **Resolution:** Can remove `emitDecoratorMetadata` from `tsconfig.spec.json` if not needed

### Future Improvements

1. **Testing:**
   - Resolve MSW polyfill issues for integration tests
   - Add component integration tests with Testing Library
   - Add E2E tests with Playwright or Cypress
   - Add visual regression testing

2. **CI/CD:**
   - GitHub Actions or GitLab CI pipeline
   - Automated Docker builds
   - Deploy to container registry
   - Kubernetes deployment manifests

3. **Monitoring:**
   - Configure NGX-Logger server endpoint
   - Add application performance monitoring (APM)
   - Add error tracking (e.g., Sentry)

4. **Code Quality:**
   - Add ESLint rules (currently using ng lint)
   - Add SonarQube or CodeClimate integration
   - Add automated dependency updates (Dependabot)

## 9. Summary

**What was configured:**

1. **Testing Infrastructure:**
   - ✅ Jest with Angular preset
   - ✅ Path aliases matching tsconfig
   - ✅ 80% coverage threshold
   - ✅ Unit test example (8 passing tests)
   - ✅ MSW handlers for integration tests
   - ⚠️  Integration tests require additional polyfills (see `tests/README.md`)

2. **Pre-commit Hooks:**
   - ✅ Husky + lint-staged
   - ✅ Related tests run on changed files
   - ✅ Prettier formatting
   - ✅ Conventional commits validation

3. **Structured Logging:**
   - ✅ NGX-Logger installed and configured
   - ✅ Dev: DEBUG level, Prod: ERROR level
   - ✅ Example usage in ApiService

4. **Docker Deployment:**
   - ✅ Multi-stage Dockerfile (node:20-alpine + nginx:alpine)
   - ✅ Runtime environment injection via docker-entrypoint.sh
   - ✅ Docker Compose configuration
   - ✅ Nginx with SPA routing, compression, caching, security headers
   - ✅ build.sh script for convenience

5. **Documentation:**
   - ✅ README.md updated with testing and Docker sections
   - ✅ tests/README.md with integration test setup notes
   - ✅ This summary document

**Ready for:**
- Local development with `npm start`
- Unit testing with `npm test`
- Docker deployment with `./build.sh && docker-compose up`
- Production deployment with custom API_URL environment variable

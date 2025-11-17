# CI/CD Pipeline

## Context
KbClient Angular frontend needs automated testing and deployment pipeline.

## Current State
- Manual test runs (`npm test`, `npm run test:integration`)
- No automated checks on PR
- No deployment automation
- No code quality gates

## Task
Set up CI/CD pipeline:
1. GitHub Actions workflow
2. Run unit tests on every PR
3. Run integration tests
4. Lint checking (ESLint, Prettier)
5. Build verification
6. Code coverage reporting
7. Branch protection rules
8. Optional: Deploy to staging on merge

## Pipeline Stages
1. **Checkout & Setup**: Node.js, npm cache
2. **Lint**: ESLint, Prettier check
3. **Unit Tests**: Jest with coverage
4. **Integration Tests**: Start json-server, run tests
5. **Build**: Production build check
6. **Report**: Coverage badge, test results

## Files to Reference
- `package.json` - npm scripts
- `jest.config.js` - Test configuration
- `jest.integration.config.js` - Integration test config

## Acceptance Criteria
- [ ] GitHub Actions workflow file
- [ ] Runs on PR to main/develop
- [ ] Unit tests pass gate
- [ ] Integration tests pass gate
- [ ] ESLint passes
- [ ] Build succeeds
- [ ] Coverage report generated
- [ ] Branch protection enabled
- [ ] Status checks required before merge
- [ ] Workflow completes in < 10 minutes

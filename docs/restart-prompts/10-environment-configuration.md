# Environment Configuration

## Context
KbClient Angular frontend needs proper environment configuration for dev/staging/prod deployments.

## Current State
- Hardcoded API URL in ApiService (likely localhost:5000)
- No environment-specific configuration
- No feature flags
- Single build for all environments

## Task
Implement environment configuration:
1. Angular environment files (environment.ts, environment.prod.ts)
2. API base URL configuration
3. Feature flags support
4. Build-time vs runtime configuration
5. Secrets management (no secrets in repo)
6. Environment-specific behaviors

## Configuration Items
- API base URL
- Debug/verbose logging
- Feature flags (enable/disable features)
- Analytics tracking ID
- Error reporting endpoint
- Build version/timestamp

## Files to Reference
- `src/app/services/api.service.ts` - Where API URL is used
- `angular.json` - Build configurations
- `src/environments/` - Angular environment files (if exists)

## Acceptance Criteria
- [ ] environment.ts for development
- [ ] environment.prod.ts for production
- [ ] environment.staging.ts for staging
- [ ] API URL configurable per environment
- [ ] Build commands: `ng build --configuration=prod`
- [ ] Feature flags object
- [ ] No hardcoded URLs in services
- [ ] Runtime config option (load from external JSON)
- [ ] Documented configuration options

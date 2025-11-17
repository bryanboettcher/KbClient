# Authentication & Authorization

## Context
KbClient Angular frontend has no authentication. Future production use requires user login and protected routes.

## Current State
- No auth system
- All routes publicly accessible
- No user context
- API calls have no auth headers

## Task
Implement authentication flow:
1. Login page/component
2. Auth service (JWT or session-based)
3. Route guards for protected pages
4. HTTP interceptor to attach auth tokens
5. User context (current user info)
6. Logout functionality
7. Token refresh handling

## Architecture Decisions
- **Auth method**: JWT vs Session cookies
- **Storage**: localStorage, sessionStorage, or memory
- **OAuth providers**: Google, Microsoft, custom IdP
- **Token refresh**: Silent refresh vs redirect

## Files to Reference
- `src/app/services/api.service.ts` - Where to inject auth headers
- `src/app/app-routing.module.ts` or routing config - Where to add guards

## Acceptance Criteria
- [ ] Login form with validation
- [ ] Auth service managing tokens/session
- [ ] Route guards protecting authenticated pages
- [ ] Auto-attach auth headers to API requests
- [ ] Handle 401 responses (redirect to login)
- [ ] Token refresh before expiration
- [ ] User info available app-wide
- [ ] Logout clears state and redirects
- [ ] Tests for auth flows

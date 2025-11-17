# API Contract Coordination

## Context
KbClient Angular frontend has working json-server mock API with integration tests validating contracts. Backend team needs clear specification of expected API behavior to implement compatible endpoints.

## Current State
- json-server mock implements full product API (`docs/API_PROPOSAL.md`)
- 27 integration tests validate API contracts
- Frontend service layer ready for backend APIs
- No formal contract testing between frontend and backend
- Backend team lacks executable specification

## Task
Establish API contract coordination process:
1. Share json-server mock as executable specification
2. Backend team implements endpoints matching mock behavior
3. Backend team reviews and runs frontend integration tests
4. Establish consumer-driven contract testing approach
5. Document contract verification process

## API Contract Specification
Frontend expects backend to implement product API matching:
- Request/response shapes defined in `docs/API_PROPOSAL.md`
- Integration tests in `tests/integration/product-api.integration.spec.ts` (27 tests)
- json-server mock in `server/server.js` (executable specification)

### Key Contract Points
- Pagination: `totalItems` reflects filtered count, not total database count
- Date format: ISO 8601 with optional nanosecond precision
- Null handling: Nullable fields either omitted or explicitly null (clarify with backend)
- Enable/disable pattern: Option A (PATCH), B (sub-resource), or C (RPC-style) - needs decision

## Contract Testing Options

### Option A: Pact Framework (Consumer-Driven)
- Frontend defines contracts in Pact format
- Backend verifies implementation matches contracts
- Shared expectations prevent API drift
- Language-specific libraries (JavaScript, C#/.NET)

### Option B: OpenAPI Specification
- Single source of truth for API surface
- Code generation possible for client/server
- SDK generation for type safety
- Less executable, more declarative

### Option C: Shared TypeScript Interfaces
- Frontend and backend share interfaces via monorepo
- Build-time type safety
- Requires shared package/repo structure
- Works well for Node.js/TypeScript backends

### Option D: Use json-server as Reference Implementation
- Backend implements endpoints matching json-server behavior
- Backend team runs frontend integration tests against their implementation
- Frontend integration tests become acceptance criteria
- Low overhead, immediate feedback

## Recommended Approach
**Option D (json-server as reference) + formalized contract**:
- Backend implements endpoints matching json-server behavior
- Backend runs frontend integration tests (`npm run test:integration`) against their API
- All 27 tests must pass
- Tests serve as executable specification and acceptance criteria

## Files to Reference
- `docs/API_PROPOSAL.md` - Detailed API specification (open questions included)
- `tests/integration/product-api.integration.spec.ts` - Contract tests (27 tests)
- `server/server.js` - Reference implementation (json-server mock)
- `src/app/services/product.service.ts` - Frontend API client

## Acceptance Criteria
- [ ] Backend team has json-server mock running locally
- [ ] Backend team has reviewed `docs/API_PROPOSAL.md` and flagged any ambiguities
- [ ] Backend team has decided on enable/disable pattern (A/B/C)
- [ ] Backend team provides implementation timeline
- [ ] Contract testing approach documented (Pact, OpenAPI, shared interfaces, or option D)
- [ ] Agreement on field nullability handling
- [ ] Agreement on date format precision (nanoseconds or milliseconds)
- [ ] First integration test passes against backend implementation
- [ ] All 27 integration tests pass against backend implementation

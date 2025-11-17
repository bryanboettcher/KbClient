# Product Create/Edit Forms

## Context
KbClient Angular frontend has product list with filtering, sorting, pagination, enable/disable, and delete actions. Missing: Create and Edit forms.

## Current State
- ProductService has `createProduct()` and `updateProduct()` methods ready
- json-server endpoints exist for POST and PUT
- No UI forms implemented yet
- 129 unit tests, 27 integration tests passing

## Task
Implement Product Create and Edit forms with:
1. Reactive forms with validation
2. Route: `/products/new` and `/products/:id/edit`
3. Form fields matching Product model (sku, name, dimensions, quantity, etc.)
4. Success/error feedback
5. Navigation back to list after save
6. Unit tests for form validation and submission

## Files to Reference
- `src/app/models/product.model.ts` - Product interface
- `src/app/services/product.service.ts` - createProduct/updateProduct methods
- `docs/API_PROPOSAL.md` - Request/response shapes
- `server/server.js` - Mock API endpoints

## Acceptance Criteria
- [ ] Create form at `/products/new`
- [ ] Edit form at `/products/:id/edit` (pre-populated)
- [ ] Form validation (required fields, formats)
- [ ] Loading states during submission
- [ ] Error handling for API failures
- [ ] Tests covering form logic
- [ ] Consistent styling with existing UI

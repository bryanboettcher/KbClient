# Bulk Actions

## Context
KbClient Angular frontend has single-item actions (enable, disable, delete). Need multi-select and bulk operations.

## Current State
- Individual action buttons per row
- No selection mechanism
- No bulk operations
- Each action is synchronous

## Task
Implement bulk actions:
1. Checkbox selection in table rows
2. Select all / deselect all
3. Bulk enable selected products
4. Bulk disable selected products
5. Bulk delete with confirmation
6. Progress indicator for batch operations
7. Partial success handling

## UX Considerations
- Selection count indicator
- Bulk action toolbar (appears when items selected)
- Confirmation for destructive bulk actions
- Handle mixed states (some succeed, some fail)
- Undo/cancel bulk operations

## Files to Reference
- `src/app/features/products/product-list/product-list.component.ts` - Current single actions
- `src/app/services/product.service.ts` - API methods

## Acceptance Criteria
- [ ] Checkbox column in table
- [ ] Select all checkbox in header
- [ ] Bulk action toolbar
- [ ] Bulk enable/disable/delete
- [ ] Progress feedback during operation
- [ ] Error summary for partial failures
- [ ] Clear selection after action
- [ ] Keyboard accessible selection
- [ ] Tests for bulk operations
- [ ] API calls optimized (batch endpoint or parallel)

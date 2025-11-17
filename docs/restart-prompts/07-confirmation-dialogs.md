# Confirmation Dialogs & Modal System

## Context
KbClient Angular frontend uses browser's native `confirm()` dialog for delete confirmations. Need custom modal system.

## Current State
- Browser `confirm()` for delete confirmation
- No modal/dialog infrastructure
- No customizable confirmation UI
- Inconsistent with app styling

## Task
Implement custom modal/dialog system:
1. Reusable modal component
2. Confirmation dialog service
3. Different dialog types (confirm, alert, prompt)
4. Customizable buttons and messages
5. Backdrop click handling
6. Keyboard support (Escape to close)
7. Animation (fade in/out)

## Architecture
- Modal container at app root
- Service-based API for opening dialogs
- Promise or Observable-based response
- Template-driven content projection

## Files to Reference
- `src/app/features/products/product-list/product-list.component.ts` - Current confirm usage in `confirmDelete()`

## Acceptance Criteria
- [ ] Generic modal component
- [ ] DialogService with confirm/alert methods
- [ ] Returns Promise<boolean> for user response
- [ ] Customizable title, message, button labels
- [ ] Danger styling for destructive actions
- [ ] Escape key closes dialog
- [ ] Click outside closes (configurable)
- [ ] Focus trapping inside modal
- [ ] Accessible (ARIA roles)
- [ ] Tests for dialog behavior

# Form Validation & Reactive Forms

## Context
KbClient Angular frontend needs robust form validation for product create/edit and future forms.

## Current State
- Filter controls use basic ngModel binding
- No reactive forms implemented
- No validation framework
- No consistent error message display

## Task
Implement comprehensive form validation:
1. Reactive forms for all user input
2. Custom validators (SKU format, etc.)
3. Async validators (check SKU uniqueness)
4. Consistent error message display
5. Form-level and field-level validation
6. Touched/dirty state handling
7. Submit button enable/disable based on validity

## Validation Rules (Example for Product)
- SKU: Required, format pattern, unique
- Name: Optional, max length
- Quantity: Required, positive integer
- Dimensions: All positive numbers if provided
- Stock threshold: Positive integer or null

## Files to Reference
- `src/app/models/product.model.ts` - Field constraints
- Any existing form components

## Acceptance Criteria
- [ ] Reactive forms with FormBuilder
- [ ] Built-in validators (required, min, max, pattern)
- [ ] Custom validators for business rules
- [ ] Async validators for server-side checks
- [ ] Inline error messages
- [ ] Error message component (reusable)
- [ ] Form dirty/pristine tracking
- [ ] Unsaved changes warning
- [ ] Tests for validation logic

# State Management

## Context
KbClient Angular frontend uses component-local state for products list. As app grows, need centralized state management.

## Current State
- ProductListComponent manages its own products array, loading, error states
- No shared state between components
- Each component fetches its own data
- Filter/sort state lost on navigation

## Task
Evaluate and implement state management:
1. Choose approach: NgRx, Signals, or service-based (BehaviorSubject)
2. Centralize product state (list, selected, filters)
3. Cache API responses appropriately
4. Persist filter/sort preferences
5. Enable state sharing across routes

## Options
- **NgRx**: Full Redux pattern, good for large apps, steep learning curve
- **Angular Signals** (v17+): Modern reactive primitives, simpler than NgRx
- **Service + BehaviorSubject**: Simple, no dependencies, good for medium apps

## Files to Reference
- `src/app/features/products/product-list/product-list.component.ts` - Current state management
- `src/app/services/product.service.ts` - Data fetching

## Acceptance Criteria
- [ ] Centralized product state store
- [ ] Components subscribe to state, don't own it
- [ ] Filter/sort state persists across navigation
- [ ] Optimistic updates for mutations
- [ ] Loading/error states in store
- [ ] DevTools integration (if NgRx)
- [ ] Tests for state transitions

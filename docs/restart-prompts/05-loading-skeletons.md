# Loading Skeletons & UX Polish

## Context
KbClient Angular frontend uses basic loading spinners. Skeleton screens provide better perceived performance.

## Current State
- Simple "Loading..." text or spinner
- Content jumps when data loads
- No skeleton placeholders
- Basic styling

## Task
Implement loading skeletons and polish UX:
1. Skeleton components for table rows
2. Skeleton for product cards (if applicable)
3. Smooth transitions when data loads
4. Shimmer/pulse animation
5. Preserve layout to prevent content jumps
6. Consider empty states (no products found)

## Implementation Approach
- Reusable skeleton component
- CSS animations (shimmer effect)
- Match actual content dimensions
- Progressive loading (show what you have)

## Files to Reference
- `src/app/features/products/product-list/product-list.component.html` - Current loading states
- `src/app/features/products/product-list/product-list.component.scss` - Styling

## Acceptance Criteria
- [ ] Skeleton table rows matching real layout
- [ ] Shimmer/pulse animation
- [ ] No layout shift when content loads
- [ ] Empty state design (no results)
- [ ] Error state design
- [ ] Smooth fade-in for loaded content
- [ ] Reusable skeleton components
- [ ] Accessible (screen reader friendly)

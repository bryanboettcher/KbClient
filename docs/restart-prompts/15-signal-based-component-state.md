# Signal-Based Component State Migration

## Context
KbClient Angular 19 application currently uses traditional class properties for component state. Angular 19 introduces signals as the modern reactive primitive for fine-grained reactivity and improved change detection performance.

## Current State
Components use traditional class properties for state:
```typescript
loading = false;
mode: 'create' | 'edit' = 'create';
productId: string | null = null;
```

This works but:
- Doesn't provide fine-grained reactivity
- Change detection runs for entire component tree
- No built-in derived state computation
- Less explicit about reactive dependencies

## Task
Migrate components to use signal-based state management for local component state:

1. **Identify components** with mutable state (loading flags, mode switches, form states)
2. **Convert properties to signals** using `signal()` from `@angular/core`
3. **Use computed signals** for derived state using `computed()`
4. **Update templates** to call signal functions (e.g., `loading()` instead of `loading`)
5. **Migrate effects** to use `effect()` for side effects based on signal changes
6. **Update tests** to work with signal-based state

## Scope
**Local component state only** - NOT application-wide state management:
- Loading flags
- UI mode switches (create/edit, expanded/collapsed)
- Form validation states
- Local filters/sort that don't need persistence
- UI-specific toggles

**Out of scope** (covered by prompt #03 - State Management):
- Application-wide product state
- Cross-component shared state
- State persistence
- API response caching

## Files to Migrate

### Priority 1 (High value)
- `src/app/features/products/product-form/product-form.component.ts` - loading, mode, productId
- `src/app/features/products/product-list/product-list.component.ts` - loading, products array

### Priority 2 (Medium value)
- Other feature components with local state
- Shared UI components (dialogs, modals when implemented)

## Benefits
- **Fine-grained reactivity**: Only components using specific signals re-render
- **Better performance**: OnPush change detection works better with signals
- **Type safety**: Signal types are inferred
- **Derived state**: `computed()` automatically tracks dependencies
- **Modern Angular**: Aligns with Angular 19+ best practices
- **Future-proof**: Signal-based components for future signal-based inputs

## Migration Pattern

### Before
```typescript
export class ProductFormComponent {
  loading = false;
  mode: 'create' | 'edit' = 'create';
  productId: string | null = null;

  ngOnInit() {
    if (this.mode === 'edit' && this.productId) {
      this.loading = true;
      this.fetchProduct(this.productId);
    }
  }
}
```

### After
```typescript
import { signal, computed, effect } from '@angular/core';

export class ProductFormComponent {
  loading = signal(false);
  mode = signal<'create' | 'edit'>('create');
  productId = signal<string | null>(null);

  // Computed signal for derived state
  isEditMode = computed(() => this.mode() === 'edit');
  shouldFetchProduct = computed(() =>
    this.isEditMode() && this.productId() !== null
  );

  constructor() {
    // Effect runs when signals change
    effect(() => {
      if (this.shouldFetchProduct()) {
        this.loading.set(true);
        this.fetchProduct(this.productId()!);
      }
    });
  }
}
```

### Template Changes
```html
<!-- Before -->
<div *ngIf="loading" class="spinner">Loading...</div>
<h1>{{ mode === 'create' ? 'Create' : 'Edit' }} Product</h1>

<!-- After -->
<div *ngIf="loading()" class="spinner">Loading...</div>
<h1>{{ mode() === 'create' ? 'Create' : 'Edit' }} Product</h1>
```

## Test Migration Pattern

### Before
```typescript
it('should set loading to true', () => {
  component.loading = true;
  fixture.detectChanges();
  expect(component.loading).toBe(true);
});
```

### After
```typescript
it('should set loading to true', () => {
  component.loading.set(true);
  fixture.detectChanges();
  expect(component.loading()).toBe(true);
});
```

## Acceptance Criteria
- [ ] All component local state migrated to signals
- [ ] Derived state uses `computed()` instead of manual calculation
- [ ] Side effects use `effect()` where appropriate
- [ ] Templates updated to call signal functions
- [ ] All unit tests pass with signal-based state
- [ ] No performance regressions (signals should improve performance)
- [ ] TypeScript strict mode compliance
- [ ] Component change detection strategy documented (OnPush recommended)

## References
- Angular Signals Documentation: https://angular.dev/guide/signals
- Angular 19 Signal Components: https://blog.angular.dev/signal-components
- Migration Guide: https://angular.dev/guide/signals/rxjs-interop

## Notes
- Signals are Angular 19's recommended approach for reactive state
- Does NOT replace RxJS for async operations (HTTP, events)
- Does NOT replace state management libraries for app-wide state
- Focus on **local component state** that benefits from fine-grained reactivity
- Can be incrementally adopted - no need to convert entire app at once
- Consider enabling OnPush change detection after migration for max performance

## Related Prompts
- **Prompt 03 - State Management**: Application-wide state (NgRx/Signals/BehaviorSubject)
- **Prompt 06 - Form Validation**: May benefit from signal-based validation state
- **Prompt 05 - Loading Skeletons**: Loading state benefits from signal reactivity

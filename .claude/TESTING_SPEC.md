# Testing Specification

## Philosophy

**Correctness over speed.** Tests exist to verify business logic and prevent regressions.

## Test Types and Scope

### Unit Tests (`.spec.ts`)

**Location:** Next to implementation files
```
src/app/products/product-form.component.ts
src/app/products/product-form.component.spec.ts
```

**Scope:**
- Pure logic tests (no DOM rendering initially)
- All dependencies are mocked
- Test the associative principle: "Does component call service correctly?"
- Verify error handling paths

**Philosophy:**
- Mock all injected dependencies
- Permissive mocks that accept expected values
- Realistic return values without excess verbosity
- Prefer implicit assertions (test only succeeds if mock matched)
- NO exhaustive validation testing (that's the service's job)

**Example:**
```typescript
describe('ProductFormComponent', () => {
  it('calls createProduct when save is triggered', () => {
    const mockService = { createProduct: jest.fn().mockResolvedValue({ id: 1 }) };
    const component = new ProductFormComponent(mockService);

    component.onSave();

    expect(mockService.createProduct).toHaveBeenCalledWith(component.form.value);
  });

  it('handles error response', async () => {
    const mockService = { createProduct: jest.fn().mockRejectedValue(new Error('400')) };
    const component = new ProductFormComponent(mockService);

    await component.onSave();

    expect(component.errorMessage).toBe('Failed to create product');
  });
});
```

**DO NOT test:**
- Exhaustive input validation in components (test in service unit tests)
- "when calling with null", "when calling with empty string", etc.
- Template rendering (can add shallow rendering later if bugs slip through)

### Integration Tests (`/tests`)

**Location:** Separate `/tests` directory, organized by business rule
```
tests/
  product-management/
    create-product.integration.spec.ts
    update-product-inventory.integration.spec.ts
  inventory-workflows/
    receive-shipment.integration.spec.ts
```

**Scope:**
- Multi-component workflows
- Real component implementations with MSW fake backend
- Organized by business requirement, not component structure
- Can span multiple components in single test
- Replaces E2E tests (no real backend in this project)

**Philosophy:**
- Only add tests to cover actual business requirements
- No exhaustive permutations
- Assert on fake backend state OR UI state changes (prefer UI state)
- Given/When/Then structure for readability

**Example:**
```typescript
// tests/product-management/create-product.integration.spec.ts
describe('Create Product Workflow', () => {
  it('creates product and shows in product list', async () => {
    // Given: User is on product management page
    const { getByLabelText, getByRole, findByText } = render(ProductManagementPage);

    // When: User creates a new product
    await userEvent.click(getByRole('button', { name: 'New Product' }));
    await userEvent.type(getByLabelText('Product Name'), 'RC Motor X500');
    await userEvent.type(getByLabelText('SKU'), 'SKU999');
    await userEvent.click(getByRole('button', { name: 'Save' }));

    // Then: Product appears in list
    expect(await findByText('RC Motor X500')).toBeInTheDocument();
    expect(await findByText('SKU999')).toBeInTheDocument();
  });
});
```

**Assertions:**
- Prefer: Verify UI state changes (success messages, list updates, form resets)
- Optional: Assert on MSW captured requests for complex payloads
- NO: Exhaustive internal integration test permutations

## Test Infrastructure

### Frameworks

- **Unit Tests:** Jest (pure logic, mocked dependencies)
- **Integration Tests:** Jest + Testing Library + MSW (Mock Service Worker)
- **E2E Tests:** None (integration tests with MSW replace them)

### Mock Service Worker (MSW)

**Purpose:** Intercept HTTP requests and return responses based on OpenAPI spec

**Setup:**
```typescript
// tests/setup/msw-server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers'; // Generated from OpenAPI

export const server = setupServer(...handlers);
```

**OpenAPI Integration:**
- Generate MSW handlers from `openapi.yaml`
- Handlers return realistic mock responses
- Integration tests use MSW to fake the KbStore API

### Coverage Targets

- **Minimum:** 80% line coverage
- **Critical paths:** 100% coverage (data mutations, business logic)
- **Philosophy:** Coverage is a metric, not a goal. Focus on meaningful tests.

## Quality Gates

### Pre-commit Hooks

- Run related unit tests for changed files
- Linting (ESLint)
- Formatting (Prettier)

### CI Pipeline (Future)

- All unit tests must pass
- Integration tests must pass
- Coverage threshold: 80%
- Build must succeed

## File Organization

```
src/
├── app/
│   ├── products/
│   │   ├── product-list.component.ts
│   │   ├── product-list.component.spec.ts      # Unit test
│   │   ├── product-form.component.ts
│   │   └── product-form.component.spec.ts      # Unit test
│   └── services/
│       ├── product.service.ts
│       └── product.service.spec.ts             # Unit test
└── tests/
    ├── setup/
    │   ├── msw-server.ts                       # MSW configuration
    │   └── handlers.ts                         # MSW handlers from OpenAPI
    └── product-management/
        ├── create-product.integration.spec.ts  # Integration test
        └── update-product.integration.spec.ts  # Integration test
```

## Naming Conventions

### Unit Tests
- **File:** `<component-name>.spec.ts`
- **Describe block:** Component/service name
- **Test cases:** Action-oriented ("calls service when save triggered")

### Integration Tests
- **File:** `<business-rule>.integration.spec.ts`
- **Describe block:** Business workflow name
- **Test cases:** User story format ("creates product and shows in list")
- **Structure:** Given/When/Then comments for clarity

## Examples

### Good Unit Test
```typescript
// product.service.spec.ts
describe('ProductService', () => {
  it('sends POST to /products with payload', () => {
    const mockHttp = { post: jest.fn().mockReturnValue(of({ id: 1 })) };
    const service = new ProductService(mockHttp);

    service.createProduct({ name: 'Motor', sku: 'SKU001' });

    expect(mockHttp.post).toHaveBeenCalledWith('/products', { name: 'Motor', sku: 'SKU001' });
  });
});
```

### Good Integration Test
```typescript
// tests/product-management/create-product.integration.spec.ts
describe('Product Creation Workflow', () => {
  it('creates product with inventory link', async () => {
    // Given: User has inventory item available
    server.use(
      http.get('/inventory', () => HttpResponse.json([
        { id: 1, partNumber: 'MOTOR-001', description: 'Brushless Motor' }
      ]))
    );

    // When: User creates product linked to inventory
    const { getByLabelText, getByRole, findByText } = render(ProductFormComponent);
    await userEvent.type(getByLabelText('Name'), 'Motor Single');
    await userEvent.selectOptions(getByLabelText('Inventory'), '1');
    await userEvent.click(getByRole('button', { name: 'Create' }));

    // Then: Product is created and linked
    expect(await findByText('Product created')).toBeInTheDocument();
  });
});
```

## Evolution

**Current State:** Pure logic unit tests
**Future:** Add shallow rendering if bugs slip through integration tests
**Future:** Add visual regression testing if needed
**Future:** Add accessibility testing (axe-core) if needed

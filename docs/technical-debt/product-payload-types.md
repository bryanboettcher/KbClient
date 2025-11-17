# Technical Debt: Product Payload Type Mismatch

## Issue
The `CreateProductPayload` and `UpdateProductPayload` interfaces in `/src/app/models/product.model.ts` do not match the actual API contract.

## Current State
**Model definitions:**
```typescript
export interface CreateProductPayload {
  name: string;
  description?: string;
  sku?: string;
  price?: number;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
}
```

**Actual API contract** (per `docs/API_PROPOSAL.md` and integration tests):
- POST /api/products accepts all Product fields (minus server-generated: productId, createdOn, updatedOn)
- PUT /api/products accepts all Product fields (minus server-generated)
- Fields: sku, name, dimensions, quantity, inventoryId, stockThreshold, leadTime, isStocked, isEnabled, isAvailable

## Impact
- TypeScript type checking fails for product form submissions
- ProductFormComponent uses `as any` type assertion to bypass (see line 138-139)
- Type safety compromised for create/update operations

## Root Cause
The payload interfaces appear to be legacy definitions from an earlier API design that included `description` and `price` fields that don't exist in the current Product model.

## Recommended Fix
Update the model file to reflect the actual API contract:

```typescript
export interface CreateProductPayload {
  sku: string;
  name: string | null;
  dimensions: ProductDimensions | null;
  quantity: number;
  inventoryId: string | null;
  stockThreshold: number | null;
  leadTime: string | null;
  isStocked: boolean;
  isEnabled: boolean;
  isAvailable: boolean;
}

export interface UpdateProductPayload {
  sku?: string;
  name?: string | null;
  dimensions?: ProductDimensions | null;
  quantity?: number;
  inventoryId?: string | null;
  stockThreshold?: number | null;
  leadTime?: string | null;
  isStocked?: boolean;
  isEnabled?: boolean;
  isAvailable?: boolean;
}
```

Alternatively, if the backend supports partial updates (PATCH semantics), UpdateProductPayload could be:
```typescript
export type UpdateProductPayload = Partial<Omit<Product, 'productId' | 'createdOn' | 'updatedOn'>>;
```

## Priority
Medium - Impacts type safety but doesn't block functionality

## Affected Files
- `/src/app/models/product.model.ts` - Type definitions
- `/src/app/features/products/product-form/product-form.component.ts` - Uses type assertion workaround
- `/src/app/services/product.service.ts` - Service methods typed with incorrect payloads

## Created
2024-11-17 (during product form feature implementation)

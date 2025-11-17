# Product API Proposal

This document outlines the API contract the frontend expects from the backend. The frontend's json-server mock implements these endpoints for development and testing.

## Current Implementation Status

The frontend mock server (`server/server.js`) implements these endpoints. Integration tests validate their behavior (`tests/integration/product-api.integration.spec.ts`).

---

## Endpoints

### 1. List Products (Paginated with Filtering)

```
GET /api/products?page=0&size=25&search=term&status=enabled&sort=name&order=asc
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 0 | Zero-based page index |
| `size` | number | No | 25 | Items per page |
| `search` | string | No | - | Case-insensitive search on `name` and `sku` fields |
| `status` | enum | No | all | Filter: `enabled`, `disabled`, or `all` |
| `sort` | string | No | - | Sort field: `name`, `sku`, `quantity`, `createdOn`, `updatedOn` |
| `order` | enum | No | asc | Sort direction: `asc` or `desc` |

**Response:** `200 OK`
```json
{
  "totalItems": 25,  // Count of FILTERED results, not total DB
  "page": 0,
  "size": 25,
  "results": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440001",
      "sku": "PLA-WHT-1KG",
      "name": "PLA Filament - White 1kg",
      "dimensions": {
        "width": 20.0,
        "length": 20.0,
        "height": 7.5,
        "weight": 1.25
      },
      "quantity": 45,
      "inventoryId": "inv-001",
      "stockThreshold": 10,
      "leadTime": "72:00:00",
      "isStocked": true,
      "isEnabled": true,
      "isAvailable": true,
      "createdOn": "2024-01-15T10:30:00.0000000Z",
      "updatedOn": "2024-03-20T14:45:30.1234567Z"
    }
  ]
}
```

**Important:** `totalItems` must reflect the filtered count, not the total database count. This enables proper pagination UI.

---

### 2. Get Single Product

```
GET /api/products/:id
```

**Response:** `200 OK`
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440001",
  "sku": "PLA-WHT-1KG",
  "name": "PLA Filament - White 1kg",
  ...
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Product not found"
}
```

---

### 3. Create Product

```
POST /api/products
```

**Request Body:**
```json
{
  "sku": "NEW-SKU-001",
  "name": "New Product",
  "dimensions": { "width": 10, "length": 10, "height": 10, "weight": 1.0 },
  "quantity": 100,
  "inventoryId": "inv-001",
  "stockThreshold": 25,
  "leadTime": "48:00:00",
  "isStocked": true,
  "isEnabled": true,
  "isAvailable": true
}
```

**Response:** `201 Created`
```json
{
  "productId": "generated-uuid",
  "sku": "NEW-SKU-001",
  ...
  "createdOn": "2024-03-21T10:00:00.0000000Z",
  "updatedOn": "2024-03-21T10:00:00.0000000Z"
}
```

---

### 4. Update Product

```
PUT /api/products/:id
```

**Request Body:** Complete product representation
```json
{
  "sku": "PLA-WHT-1KG",
  "name": "Updated Name",
  ...
}
```

**Response:** `200 OK` with full updated product

---

### 5. Delete Product

```
DELETE /api/products/:id
```

**Response:** `200 OK` or `204 No Content`

**Error Response:** `404 Not Found`

---

### 6. Enable/Disable Product

**Three options for discussion:**

#### Option A: PATCH (Recommended - Standard REST)

```
PATCH /api/products/:id
```

**Request Body:**
```json
{
  "isEnabled": true
}
```

**Response:** `200 OK` with full updated product

**Pros:**
- Standard REST partial update
- Fewer endpoints
- Can update multiple fields in single request

**Cons:**
- Less explicit about intent

---

#### Option B: Sub-Resource Pattern (Pure REST)

```
POST   /api/products/:id/enabled   → Enable product
DELETE /api/products/:id/enabled   → Disable product
GET    /api/products/:id/enabled   → Get current state
```

**POST Response:** `201 Created`
```json
{
  "enabled": true
}
```

**DELETE Response:** `204 No Content`

**GET Response:** `200 OK`
```json
{
  "enabled": true
}
```

**Pros:**
- Most RESTful (state as resource)
- Self-documenting API
- Symmetric POST/DELETE
- GET endpoint useful for polling/checking

**Cons:**
- More endpoints to implement
- Requires returning full product from parent endpoint

---

#### Option C: RPC-Style (Current Frontend Implementation)

```
POST /api/products/:id/enable
POST /api/products/:id/disable
```

**Response:** `200 OK` with full updated product

**Pros:**
- Explicit intent
- Action-oriented
- Simple mental model

**Cons:**
- Not pure REST
- Asymmetric verbs

---

## Data Types

### Product
```typescript
interface Product {
  productId: string;        // UUID
  sku: string;              // Stock Keeping Unit
  name: string | null;
  dimensions: Dimensions | null;
  quantity: number;
  inventoryId: string | null;
  stockThreshold: number | null;
  leadTime: string | null;  // TimeSpan format "HH:MM:SS"
  isStocked: boolean;
  isEnabled: boolean;
  isAvailable: boolean;
  createdOn: string;        // ISO 8601 with nanoseconds
  updatedOn: string;        // ISO 8601 with nanoseconds
}

interface Dimensions {
  width: number;
  length: number;
  height: number;
  weight: number;
}

interface PaginatedResponse<T> {
  totalItems: number;
  page: number;
  size: number;
  results: T[];
}
```

---

## Error Handling

All endpoints should return consistent error responses:

```json
{
  "error": "Error message",
  "details": { ... }  // Optional additional context
}
```

**Standard HTTP Status Codes:**
- `200 OK` - Successful retrieval or update
- `201 Created` - Successful creation
- `204 No Content` - Successful deletion
- `400 Bad Request` - Invalid request body or parameters
- `404 Not Found` - Resource doesn't exist
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server-side error

---

## Testing

The frontend has integration tests that validate these contracts:
- `tests/integration/product-api.integration.spec.ts` (27 tests)

These tests use the json-server mock and can serve as executable documentation for expected behavior.

---

## Open Questions for Backend Team

1. **Enable/Disable Pattern**: Which option (A, B, or C) aligns best with the existing backend architecture?

2. **Date Format**: Is ISO 8601 with nanosecond precision (`.1234567Z`) required, or is standard millisecond precision acceptable?

3. **Null Handling**: Should nullable fields be omitted from response or explicitly sent as `null`?

4. **Validation**: What validation rules apply to each field? (max lengths, formats, etc.)

5. **Business Logic**:
   - Can an already-enabled product be enabled again (idempotent)?
   - What happens when deleting a product with inventory associations?
   - Should `isAvailable` be calculated server-side based on stock/enabled status?

---

## Next Steps

1. Backend team reviews this proposal
2. Agree on enable/disable pattern (A, B, or C)
3. Backend implements endpoints
4. Backend can use frontend's integration tests as validation suite
5. Frontend adjusts service layer if pattern changes

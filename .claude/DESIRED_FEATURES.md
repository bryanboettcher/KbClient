# KbStore Admin UI Desired Features
## Agent-Focused Requirements Document

**Purpose**: Defines required features for the Angular-based backoffice admin UI (KbClient) based on 5+ years of KB3D operational experience with PrestaShop and the KbStore domain architecture.

**Source Context**: Requirements extracted from:
- `/mnt/c/Users/bryan/source/bryanboettcher/KbStore/docs/requirements/business-operational-requirements.md`
- `/mnt/c/Users/bryan/source/bryanboettcher/KbStore/docs/prestashop-pain-points.md`
- `/mnt/c/Users/bryan/source/bryanboettcher/KbStore/KbStore.ApiService/Endpoints/` (existing API)
- Domain architecture and business workflows

---

## Products Module Features

### F-P1: Product Creation Workflow
**Priority**: CRITICAL
**Business Purpose**: Create new sellable products backed by inventory items.

**Key Capabilities**:
- Create product with SKU, name, initial quantity
- Associate with existing inventory item OR create new inventory automatically
- Set product dimensions (length, width, height, weight) for shipping calculations
- Configure stock threshold (low-stock warning level)
- Set lead time for restocking/fulfillment
- Set initial state (Enabled/Disabled)

**API Integration**:
- `POST /products` - Create product
- `GET /inventory` - Lookup existing inventory for association
- `POST /inventory` - Create new inventory if needed

**User Workflow**:
1. Admin enters product SKU (required), name (optional)
2. Choose: Link to existing inventory OR create new inventory
3. If new inventory: Enter part number, description, initial quantity
4. Enter product specifications: dimensions, weight, stock threshold, lead time
5. Submit → API creates inventory (if needed) → creates product → displays success
6. Redirect to product detail view

**Validation**:
- SKU required and unique
- Stock threshold >= 0 or null
- Lead time >= 0 or null
- Quantity >= 0

---

### F-P2: Product List with Search/Filter
**Priority**: CRITICAL
**Business Purpose**: Browse and locate products quickly for updates or review.

**Key Capabilities**:
- Paginated list of all products (default page size: 25)
- Search by SKU or name
- Filter by status (Enabled, Disabled, Discontinued)
- Sort by: SKU, name, created date, quantity
- Display: SKU, name, current quantity, status, last modified date
- Quick actions: View, Edit, Enable/Disable, Delete

**API Integration**:
- `GET /products?page={n}&pageSize={m}&search={q}&status={s}&sortBy={field}&sortOrder={asc|desc}`

**User Workflow**:
1. Admin views paginated product list
2. Uses search box to filter by SKU/name (debounced, updates on keyup)
3. Uses status dropdown to filter by state
4. Clicks column headers to sort
5. Clicks row to view product details
6. Uses quick action buttons for common operations

**Performance Requirement**:
- List loads <500ms for up to 10,000 products
- Search results update <200ms (client-side filtering if <100 items, server-side if more)

---

### F-P3: Product Detail View
**Priority**: CRITICAL
**Business Purpose**: View complete product information and access editing functions.

**Key Capabilities**:
- Display all product properties: SKU, name, dimensions, quantity, stock threshold, lead time, status
- Show associated inventory item (part number, description, location)
- Display product history timeline (created, updated, state changes)
- Quick action buttons: Edit, Enable/Disable, Delete
- Link to associated inventory detail page

**API Integration**:
- `GET /products/{id}` - Fetch product details
- `GET /inventory/{id}` - Fetch associated inventory details

**User Workflow**:
1. Admin navigates from product list or search
2. Views complete product details in read-only mode
3. Clicks Edit button to enter edit mode
4. Clicks Enable/Disable to toggle product state
5. Clicks inventory link to view inventory details

---

### F-P4: Product Update Operations
**Priority**: CRITICAL
**Business Purpose**: Modify product properties after creation.

**Key Capabilities**:
- Update product name
- Update dimensions (length, width, height, weight)
- Update quantity (sets current stock level - use cautiously)
- Update stock threshold
- Update lead time
- Enable/disable product (controls customer visibility in storefront)

**API Integration**:
- `PATCH /products/{id}/name` - Update name
- `PATCH /products/{id}/dimensions` - Update dimensions
- `PATCH /products/{id}/quantity` - Update quantity
- `PATCH /products/{id}/stock-threshold` - Update threshold
- `PATCH /products/{id}/lead-time` - Update lead time
- `PATCH /products/{id}/enable` - Enable product
- `PATCH /products/{id}/disable` - Disable product

**User Workflow**:
1. From product detail view, click Edit
2. Form pre-populated with current values
3. Modify desired fields
4. Click Save → API updates product → success notification → return to detail view
5. Each field updates independently (no need to save entire form)

**Validation**:
- Same as creation: stock threshold >= 0, lead time >= 0, dimensions > 0

**UI Pattern**: Inline editing preferred over modal forms for speed.

---

### F-P5: Product Deletion
**Priority**: HIGH
**Business Purpose**: Remove discontinued or obsolete products.

**Key Capabilities**:
- Delete product (soft delete recommended)
- Confirmation dialog with product SKU display
- Cascade handling: What happens to associated storefront items? (TBD - needs clarification)

**API Integration**:
- `DELETE /products/{id}` - Delete product

**User Workflow**:
1. From product detail or list, click Delete
2. Confirmation dialog: "Delete product {SKU}? This cannot be undone."
3. Confirm → API deletes product → success notification → redirect to product list

**Business Rule Question**: Should deletion be blocked if product has active orders? If yes, show error message and list blocking orders.

---

### F-P6: Bulk Product Operations
**Priority**: MEDIUM
**Business Purpose**: Update multiple products efficiently.

**Key Capabilities**:
- Select multiple products from list (checkboxes)
- Bulk enable/disable
- Bulk update stock threshold
- Bulk update lead time
- Export selected products to CSV

**API Integration**:
- Multiple calls to existing endpoints OR new bulk endpoint (TBD based on API design)

**User Workflow**:
1. From product list, check boxes for desired products
2. Use bulk action dropdown: Enable, Disable, Update Threshold, Export CSV
3. If update operation: Modal with field to set value applied to all
4. Confirm → API processes each product → progress indicator → success summary

**Performance Consideration**: Batch updates should process asynchronously if count > 50 to avoid UI blocking.

---

## Inventory Module Features

### F-I1: Inventory Creation Workflow
**Priority**: CRITICAL
**Business Purpose**: Add new physical inventory items to track.

**Key Capabilities**:
- Create inventory with part number (required), description (required), initial quantity
- Optional: Create associated product automatically (saves a step)
- Set backorder threshold and allowed flag

**API Integration**:
- `POST /inventory` - Create inventory
- If auto-create product: `POST /products` after inventory creation

**User Workflow**:
1. Admin enters part number, description, initial quantity
2. Checkbox: "Create matching product" (checked by default)
3. Submit → API creates inventory → (if checked) creates product → success notification
4. Redirect to inventory detail view

**Validation**:
- Part number required and unique
- Description required (non-empty)
- Quantity >= 0

---

### F-I2: Inventory List with Search/Filter
**Priority**: CRITICAL
**Business Purpose**: Browse and locate inventory items for stock management.

**Key Capabilities**:
- Paginated list of all inventory items (default page size: 25)
- Search by part number or description
- Filter by status (Available, Backordered, On Hold, Discontinued)
- Sort by: part number, description, quantity, last modified
- Display: part number, description, current quantity, status, location
- Quick actions: View, Increase Stock, Decrease Stock, Hold, Release

**API Integration**:
- `GET /inventory?page={n}&pageSize={m}&search={q}&status={s}`

**User Workflow**:
- Same pattern as product list (F-P2)

---

### F-I3: Inventory Detail View
**Priority**: CRITICAL
**Business Purpose**: View complete inventory information and access stock operations.

**Key Capabilities**:
- Display: part number, description, current quantity, status
- Show associated products (if any) that use this inventory
- Display stock transaction history (increases, decreases, holds, releases)
- Quick action buttons: Increase Stock, Decrease Stock, Hold, Release, Update Description

**API Integration**:
- `GET /inventory/{id}` - Fetch inventory details
- Future: `GET /inventory/{id}/transactions` - Fetch stock history

**User Workflow**:
1. Admin navigates from inventory list
2. Views inventory details and transaction history
3. Clicks stock operation buttons to adjust quantity
4. Clicks product links to view products using this inventory

---

### F-I4: Inventory Stock Adjustment Operations
**Priority**: CRITICAL
**Business Purpose**: Adjust inventory quantities for restocking, sales, damage, etc.

**Key Capabilities**:
- Increase quantity (restocking shipments received)
- Decrease quantity (manual sales, damage, loss, theft)
- Hold inventory (temporarily reserve for special order)
- Release inventory (unreserve held stock)
- Update description

**API Integration**:
- `PATCH /inventory/{id}/increase/{quantity}` - Increase stock
- `PATCH /inventory/{id}/decrease/{quantity}` - Decrease stock
- `PATCH /inventory/{id}/hold` - Hold inventory
- `PATCH /inventory/{id}/release` - Release hold
- `PATCH /inventory/{id}/description` - Update description

**User Workflow - Increase/Decrease**:
1. From inventory detail, click Increase or Decrease Stock
2. Modal: "Enter quantity to add/remove" with input field
3. Optional: Reason dropdown (Restocking, Sale, Damage, Loss, Adjustment)
4. Submit → API updates quantity → success notification → detail view refreshes

**User Workflow - Hold/Release**:
1. Click Hold button
2. Confirmation: "Hold all available stock?"
3. Confirm → API holds inventory → status changes to "On Hold"
4. Release button appears → click to release hold

**Validation**:
- Increase/decrease quantity must be > 0
- Decrease quantity cannot exceed available (non-held) stock
- Hold fails if inventory already on hold

---

### F-I5: Inventory Deletion
**Priority**: HIGH
**Business Purpose**: Remove obsolete inventory items.

**Key Capabilities**:
- Delete inventory item
- Confirmation dialog
- Cascade handling: Block deletion if inventory has associated products (show error and list products)

**API Integration**:
- `DELETE /inventory/{id}` - Delete inventory

**User Workflow**:
1. Click Delete from inventory detail
2. If associated products exist: Error "Cannot delete inventory. Used by products: {SKU1}, {SKU2}. Delete products first."
3. If no products: Confirmation dialog
4. Confirm → API deletes inventory → redirect to inventory list

---

### F-I6: Low Stock Alerts Dashboard
**Priority**: HIGH
**Business Purpose**: Proactively identify inventory items needing restocking.

**Key Capabilities**:
- Dashboard widget showing inventory items below stock threshold
- Sort by: most urgent (lowest % of threshold), part number, quantity
- Display: part number, description, current quantity, threshold, shortage amount
- Quick action: Restock button opens increase quantity modal

**API Integration**:
- `GET /inventory?filter=low-stock` OR separate endpoint
- Future: WebSocket for real-time updates when stock drops below threshold

**User Workflow**:
1. Dashboard displays low stock items automatically
2. Admin reviews list sorted by urgency
3. Clicks Restock → opens increase quantity modal
4. Enters quantity received → submits → stock updated

**Frequency**: High-priority staff use this daily for reorder decisions.

---

## Cross-Module Features

### F-X1: Dashboard Overview
**Priority**: CRITICAL
**Business Purpose**: Provide at-a-glance operational status for staff.

**Key Capabilities**:
- Total products (enabled, disabled, discontinued counts)
- Total inventory items (available, on hold, backordered counts)
- Low stock alerts count (clickable to F-I6)
- Recent activity timeline (products created, inventory adjusted, etc.)
- Quick action buttons: Create Product, Create Inventory

**API Integration**:
- `GET /products/stats` - Product counts
- `GET /inventory/stats` - Inventory counts
- `GET /activity/recent` - Recent operations (future)

**User Workflow**:
1. Admin logs in → lands on dashboard
2. Reviews stats and alerts
3. Clicks alert count → navigates to relevant filtered list
4. Uses quick action buttons for common tasks

**Frequency**: Every session start. Most viewed page.

---

### F-X2: Activity Audit Log
**Priority**: MEDIUM
**Business Purpose**: Track who changed what and when for accountability.

**Key Capabilities**:
- Paginated log of all operations (create, update, delete)
- Display: timestamp, user, operation type, entity type, entity ID, changes made
- Filter by: date range, user, entity type, operation type
- Search by entity ID or SKU/part number

**API Integration**:
- Future endpoint: `GET /audit/log?startDate={d1}&endDate={d2}&user={u}&entityType={t}`

**User Workflow**:
1. Admin navigates to Audit Log page
2. Sets filters for desired scope
3. Reviews operations performed
4. Clicks entity ID to view details

**Frequency**: Used during issue investigation or periodic reviews.

---

### F-X3: Import Products from CSV
**Priority**: HIGH
**Business Purpose**: Bulk load product catalog from external sources (PrestaShop migration, supplier feeds).

**Key Capabilities**:
- Upload CSV file with product data
- Map CSV columns to product fields
- Validate data before import
- Preview import (show first 10 rows with validation status)
- Execute import with progress indicator
- Download error report for failed rows

**API Integration**:
- `POST /products/import/validate` - Upload and validate CSV
- `POST /products/import/execute` - Execute import

**CSV Format**:
```
SKU,Name,Quantity,Width,Height,Length,Weight,StockThreshold,LeadTimeDays
WIDGET-001,Widget,100,10,10,10,0.5,25,7
```

**User Workflow**:
1. Navigate to Import Products page
2. Upload CSV file
3. Map columns (auto-detect if headers match)
4. Click Validate → API validates → shows preview with errors highlighted
5. Fix CSV and re-upload OR proceed with valid rows
6. Click Execute → API processes import → progress bar → completion summary
7. Download error report if any rows failed

**Frequency**: Used during initial setup and periodic bulk updates.

---

### F-X4: Export Products to CSV
**Priority**: MEDIUM
**Business Purpose**: Extract product data for reporting, backup, or external system integration.

**Key Capabilities**:
- Export all products or filtered selection
- Include inventory details (optional)
- Generate CSV download

**API Integration**:
- `GET /products/export?format=csv&includeInventory={bool}&filter={...}`

**User Workflow**:
1. From product list, apply desired filters
2. Click Export button
3. Choose: All products OR Selected products (if checkboxes used)
4. Choose: Include inventory details (checkbox)
5. Click Generate → API returns CSV file → browser downloads

**Frequency**: Weekly or monthly for reporting/backup.

---

## Future Features (Not Yet Prioritized)

### Product Bundles/Packs Management
**Business Purpose**: Create bundles that combine multiple inventory items into single purchasable product.

**Key Requirements** (from business docs):
- Define bundle composition (2x Item A + 1x Item B = Bundle C)
- Auto-calculate bundle availability based on constituent inventory
- Recalculate asynchronously when constituent stock changes
- Prevent PrestaShop pain point: Never block checkout waiting for bundle recalculation

**API Design Needed**: This requires storefront domain implementation first.

**Priority**: HIGH (after storefront domain exists)

---

### Product Configurator
**Business Purpose**: Allow customers to build custom assemblies from compatible components.

**Key Requirements**:
- Define configuration rules (compatibility, dependencies)
- Validate customer selections
- Generate dynamic "product" from configuration
- Check availability of all components at checkout

**Complexity**: Configuration validation logic not yet defined. Needs stakeholder input.

**Priority**: HIGH (essential feature from operational experience)

---

### Image Management
**Business Purpose**: Upload and manage product images with automatic optimization.

**Key Requirements**:
- Upload product images (JPEG, PNG)
- Auto-convert to WebP and AVIF formats
- Generate multiple sizes (thumbnail, gallery, full-size)
- Associate images with products
- Set primary image and image order

**API Design Needed**: Requires image processing infrastructure (likely separate service).

**Priority**: HIGH (customer-facing feature)

---

### SEO and URL Management
**Business Purpose**: Optimize product pages for search engines.

**Key Requirements**:
- Custom URL slugs for products
- Meta tags (title, description, keywords)
- Canonical URLs
- 301 redirects for changed URLs
- Sitemap generation

**API Design Needed**: URL management may span multiple domains.

**Priority**: MEDIUM (important but not blocking operations)

---

### Wishlist Management
**Business Purpose**: View and manage customer wishlists.

**Key Requirements**:
- View customer wishlists
- See which products are most wishlisted
- Notify customers of price drops on wishlisted items

**API Design Needed**: Requires customer domain and wishlist domain implementation.

**Priority**: MEDIUM

---

### Quotation System
**Business Purpose**: Generate quotes for large or custom orders.

**Key Requirements**:
- Convert cart to quote request
- Admin reviews quote request
- Admin generates formal quote with pricing and terms
- Send quote to customer
- Customer accepts → converts to order

**API Design Needed**: Requires order domain implementation.

**Priority**: HIGH (essential for B2B operations)

---

## Technical Considerations

### Real-Time Updates
**Requirement**: When inventory quantity changes (from another admin user, or from customer orders), the admin UI should reflect changes without manual refresh.

**Implementation Approach**:
- WebSocket connection or Server-Sent Events
- Subscribe to inventory/product change events
- Update UI reactively when events received

**Priority**: MEDIUM (nice-to-have, not critical)

---

### Optimistic UI Updates
**Pattern**: When admin performs operation (e.g., increase inventory), UI updates immediately (optimistically) before API confirms success.

**Benefits**:
- UI feels responsive
- Admin can continue working without waiting
- Errors are rare, so optimism is justified

**Implementation**:
- Update UI state immediately
- Send API request
- If API fails, rollback UI change and show error
- If API succeeds, no further action needed

**Priority**: HIGH (UX improvement)

---

### Offline Support
**Requirement**: Admin should be able to view (read-only) products and inventory when offline.

**Implementation Approach**:
- Service worker caches product/inventory lists
- Display cached data with "Offline Mode" banner
- Queue mutations for later sync

**Priority**: LOW (nice-to-have, not essential for initial release)

---

## API Integration Summary

### Existing Endpoints (Implemented in KbStore.ApiService)

**Products**:
- `POST /products` - Create product
- `GET /products` - List products (paginated, searchable)
- `GET /products/{id}` - Get product by ID
- `PATCH /products/{id}/name` - Update name
- `PATCH /products/{id}/dimensions` - Update dimensions
- `PATCH /products/{id}/quantity` - Update quantity
- `PATCH /products/{id}/stock-threshold` - Update stock threshold
- `PATCH /products/{id}/lead-time` - Update lead time
- `PATCH /products/{id}/enable` - Enable product
- `PATCH /products/{id}/disable` - Disable product
- `DELETE /products/{id}` - Delete product

**Inventory**:
- `POST /inventory` - Create inventory
- `GET /inventory` - List inventory (paginated, searchable)
- `GET /inventory/{id}` - Get inventory by ID
- `PATCH /inventory/{id}/increase/{quantity}` - Increase stock
- `PATCH /inventory/{id}/decrease/{quantity}` - Decrease stock
- `PATCH /inventory/{id}/description` - Update description
- `PATCH /inventory/{id}/hold` - Hold inventory
- `PATCH /inventory/{id}/release` - Release hold
- `DELETE /inventory/{id}` - Delete inventory

### Missing Endpoints (Need Implementation)

**Products**:
- `GET /products/stats` - Product counts by status
- `POST /products/import/validate` - Validate CSV import
- `POST /products/import/execute` - Execute CSV import
- `GET /products/export` - Export products to CSV

**Inventory**:
- `GET /inventory/stats` - Inventory counts by status
- `GET /inventory?filter=low-stock` - Low stock items
- `GET /inventory/{id}/transactions` - Stock transaction history

**Audit**:
- `GET /audit/log` - Activity audit log (future)

---

## UI/UX Patterns

### Responsive Design
- Desktop-first (admin staff use desktops)
- Mobile responsive for tablet use (warehouse staff on tablets)
- Minimum screen width: 1024px optimized

### Navigation Structure
```
Dashboard (/)
├── Products
│   ├── List (/products)
│   ├── Create (/products/new)
│   ├── Detail (/products/:id)
│   ├── Edit (/products/:id/edit)
│   └── Import (/products/import)
├── Inventory
│   ├── List (/inventory)
│   ├── Create (/inventory/new)
│   ├── Detail (/inventory/:id)
│   └── Low Stock Alerts (/inventory/alerts)
└── Settings (future)
    └── Audit Log (/settings/audit)
```

### Color Coding
- Green: Enabled, Available, Positive actions
- Yellow: Low stock warning, Pending states
- Red: Disabled, Errors, Destructive actions
- Blue: Informational, Neutral actions
- Gray: Discontinued, Inactive

### Loading States
- Skeleton screens for initial page loads
- Inline spinners for operations (save, delete, etc.)
- Progress bars for long operations (import, bulk updates)

---

## Success Metrics

**Admin Efficiency**:
- Time to create product: <30 seconds
- Time to adjust inventory: <15 seconds
- Time to locate product via search: <5 seconds

**System Performance**:
- Page load time: <500ms (cached), <2s (uncached)
- Search results: <200ms
- API response time: <100ms (read), <300ms (write)

**Data Integrity**:
- Zero negative inventory quantities
- Zero orphaned products (product without inventory)
- 100% audit trail coverage (all mutations logged)

---

## Open Questions Requiring Stakeholder Input

1. **Product Deletion Cascade**: When product deleted, what happens to associated storefront sellable items?
2. **Backorder Policies**: Which products allow backorders? Customer preference or product-level setting?
3. **Pricing Management**: Where is pricing managed? Storefront domain, but how does admin UI access it?
4. **Multi-Location Inventory**: Does KB3D track inventory across multiple warehouse locations?
5. **User Roles/Permissions**: Are there different admin user types with different permissions?
6. **Product Categories/Tags**: How are products organized? Hierarchical categories or flexible tagging?
7. **International Operations**: Multi-currency? Multi-language? Different inventory per region?

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
**Maintained By**: KbStore Development Team

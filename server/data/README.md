# KbStore Mock Data Files

Mock JSON data for local development with json-server.

## Files

- `products.json` - 25 3D printer component products
- `inventory.json` - 21 inventory tracking records

## Data Coverage

### Product States
- **In Stock**: 17 products with quantity >= stockThreshold
- **Low Stock**: 4 products with quantity < stockThreshold (critical visibility testing)
- **Out of Stock**: 4 products with quantity = 0 but enabled
- **Disabled/Out of Stock**: 1 product (discontinued)
- **Null name products**: 1 product (edge case handling)

### Dimension Coverage
- **Full dimensions**: 18 products (width, length, height, weight)
- **Null dimensions**: 7 products (testing optional fields)

### Lead Time Variation
- **Fast (24-48h)**: 4 products
- **Standard (48-96h)**: 10 products
- **Slow (96-168h)**: 7 products
- **Null lead time**: 1 discontinued product

### Product Categories

**Filaments (consumables)**
- PLA, PETG, ABS, TPU variants
- Varied quantities to show stock levels

**Nozzles (wear items)**
- Multiple materials: Brass, E3D, Hardened Steel, Tungsten, Ruby
- Multiple sizes: 0.4mm, 0.6mm, 0.8mm
- Tests filtering and status variations

**Mechanical Components**
- Stepper motors, pulleys, belts, rods
- Build plates (glass, flexible)
- Hotends, PTFE tubes

**Electrical**
- Thermistors (high quantity bulk item)
- Fans, heater beds
- Silicone socks

**Accessories**
- Damper feet, isolation feet
- Tests low-quantity items

## Testing Scenarios

### Stock Status
- Show all inventory levels
- Test "order soon" warnings (quantity < stockThreshold)
- Test "out of stock" alerts (quantity = 0, isStocked = false)
- Test low quantity critical items (e.g., qty=1 heated beds)

### Product Status
- Enabled/available products: normal display
- Disabled products: grayed out or hidden (qty=0 on disabled items)
- Discontinued products: null name with all statuses false

### Null Handling
- Products with null dimensions
- Products with null lead time
- Products with null inventory ID
- Products with null name (discontinued items)

### Filtering/Search
- 7 nozzle variants for category filtering
- Multiple filament types (PLA, PETG, ABS, TPU)
- Mixed SKU patterns for search testing

## How to Use

### With json-server

```bash
npm install -g json-server
json-server --watch server/data/db.json
```

Or add to package.json:
```json
{
  "scripts": {
    "server": "json-server --watch server/data/db.json --port 3001"
  }
}
```

Create `server/data/db.json`:
```json
{
  "products": /* contents of products.json */,
  "inventory": /* contents of inventory.json */
}
```

### Angular HttpClient

The mock data matches the Product and Inventory interfaces defined in:
- `/src/app/models/product.model.ts`
- `/src/app/models/inventory.model.ts`

Services expect endpoints:
- GET `/api/products` - Returns products array
- GET `/api/inventory` - Returns inventory array

## Data Generation Notes

- UUIDs: Standard v4 format for productId and inventory id fields
- Dates: ISO 8601 UTC format (createdOn, updatedOn, lastUpdated)
- Lead times: ISO 8601 duration format (HH:MM:SS)
- Quantity ranges: 0-150 units (realistic for 3D printer supplies)
- Stock thresholds: 3-50 units (varies by product type)
- Locations: Realistic warehouse bin/shelf naming
- Dates spread across 2024-2025 for realistic aging

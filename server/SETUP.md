# KbStore Mock Server Setup

Quick start guide for running the mock API server with json-server.

## Installation

```bash
npm install json-server --save-dev
```

Or globally:
```bash
npm install -g json-server
```

## Running the Server

### Option 1: Using npm script (Recommended)

Add to `package.json`:
```json
{
  "scripts": {
    "server": "json-server --watch server/data/db.json --port 3001"
  }
}
```

Then run:
```bash
npm run server
```

### Option 2: Direct command

```bash
json-server --watch server/data/db.json --port 3001
```

### Option 3: Custom configuration

Create `server/json-server.config.js`:
```javascript
module.exports = {
  "port": 3001,
  "watch": true,
  "static": "./public"
};
```

Then run:
```bash
json-server server/data/db.json --config server/json-server.config.js
```

## API Endpoints

Once running on http://localhost:3001:

### Products
- GET `/products` - Get all products
- GET `/products?quantity_lt=5` - Get low stock items
- GET `/products?isEnabled=true` - Get enabled products only
- GET `/products/550e8400-e29b-41d4-a716-446655440001` - Get single product
- POST `/products` - Create new product
- PATCH `/products/:id` - Update product
- DELETE `/products/:id` - Delete product

### Inventory
- GET `/inventory` - Get all inventory
- GET `/inventory?quantity=0` - Get out of stock items
- GET `/inventory/:id` - Get single inventory record
- PATCH `/inventory/:id` - Update inventory
- POST `/inventory` - Create inventory record

## Query Examples

```bash
# Get products below stock threshold
curl "http://localhost:3001/products?quantity_lt=20"

# Get disabled products
curl "http://localhost:3001/products?isEnabled=false"

# Get specific product
curl "http://localhost:3001/products/550e8400-e29b-41d4-a716-446655440001"

# Search by SKU (partial match requires custom filtering in client)
curl "http://localhost:3001/products?sku_like=NOZZLE"
```

## Angular Integration

Configure your services to use the mock server:

```typescript
// src/app/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001'
};

// In your service
private apiUrl = inject(environment).apiUrl;

getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.apiUrl}/products`);
}
```

## Running Dev and API Together

Use multiple terminals or process manager:

**Terminal 1: API Server**
```bash
npm run server
```

**Terminal 2: Angular App**
```bash
npm start
```

Or use a tool like concurrently:

```bash
npm install concurrently --save-dev
```

Add to package.json:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"ng serve\""
  }
}
```

Then:
```bash
npm run dev
```

## Data Files

- `data/db.json` - Combined dataset (all endpoints in one file)
- `data/products.json` - Products array only
- `data/inventory.json` - Inventory array only
- `data/README.md` - Data documentation

## Troubleshooting

### Port already in use
```bash
# Use different port
json-server --watch server/data/db.json --port 3002
```

### CORS errors
The Angular dev server proxy can handle this. See `angular.json` for proxy configuration.

### Data not updating
Make sure json-server is watching the file correctly:
```bash
json-server --watch server/data/db.json -v
```

## Database Persistence

By default, json-server keeps changes in memory only. To persist changes to disk, use the `--db` flag:

```bash
json-server --watch server/data/db.json --port 3001
```

Changes will be saved to the source file.

## Production Notes

This mock server is for development only. For production:
- Use a real backend API
- Implement proper authentication
- Add validation and business logic
- Use a real database

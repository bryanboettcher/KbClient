/**
 * Custom json-server setup with proper pagination middleware
 * This wraps json-server to intercept responses and wrap them in PaginatedResponse format
 */

const jsonServer = require('json-server');
const path = require('path');

// Suppress console output in test mode (except startup messages)
const isTestMode = process.env.NODE_ENV === 'test';
const originalLog = console.log;

if (isTestMode) {
  console.log = function(...args) {
    const message = args[0]?.toString() || '';
    // Only allow startup message to pass through so test server can detect readiness
    if (message.includes('JSON Server is running')) {
      originalLog.apply(console, args);
    }
  };
}

// Create server
const server = jsonServer.create();

// Load database
const dbPath = path.join(__dirname, 'db.js');
const db = require(dbPath)();

// Add 'id' field to each product that mirrors productId for json-server compatibility
// This allows json-server to find items by their productId
if (db.products) {
  db.products = db.products.map(product => ({
    ...product,
    id: product.productId
  }));
}

const router = jsonServer.router(db, { foreignKeySuffix: 'Id' });

// Load routes rewriter
const routesPath = path.join(__dirname, 'routes.json');
const routes = require(routesPath);

// Default middlewares (cors, logger, static files)
const middlewares = jsonServer.defaults();

// Use default middlewares
server.use(middlewares);

// Route rewriter (must come before pagination middleware and router)
server.use(jsonServer.rewriter(routes));

// Body parser for POST/PUT requests
server.use(jsonServer.bodyParser);

/**
 * Custom enable/disable action endpoints
 * These provide action-based semantics (POST /products/:id/enable)
 * In addition to RESTful PATCH support (handled by json-server router)
 */
server.post('/products/:id/enable', (req, res) => {
  const { id } = req.params;
  const db = router.db;
  const product = db.get('products').find({ productId: id }).value();

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  db.get('products').find({ productId: id }).assign({ isEnabled: true }).write();
  const updated = db.get('products').find({ productId: id }).value();
  console.log(`[Server] Enabled product ${id}`);
  res.json(updated);
});

server.post('/products/:id/disable', (req, res) => {
  const { id } = req.params;
  const db = router.db;
  const product = db.get('products').find({ productId: id }).value();

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  db.get('products').find({ productId: id }).assign({ isEnabled: false }).write();
  const updated = db.get('products').find({ productId: id }).value();
  console.log(`[Server] Disabled product ${id}`);
  res.json(updated);
});

/**
 * Reset endpoint for integration testing
 * Reloads original JSON data from disk, clearing any in-memory changes
 */
server.post('/__reset', (req, res) => {
  console.log('[Server] Resetting database to baseline...');

  try {
    // Clear require cache for db.js and JSON data files
    const dataPath = path.join(__dirname, 'data/products.json');
    const inventoryPath = path.join(__dirname, 'data/inventory.json');

    delete require.cache[require.resolve(dbPath)];
    delete require.cache[require.resolve(dataPath)];
    delete require.cache[require.resolve(inventoryPath)];

    // Reload fresh data
    const freshDb = require(dbPath)();

    // Add 'id' field to each product for json-server compatibility
    if (freshDb.products) {
      freshDb.products = freshDb.products.map(product => ({
        ...product,
        id: product.productId
      }));
    }

    // Reset the router's database
    router.db.setState(freshDb);

    console.log('[Server] Database reset complete');
    res.status(200).json({
      success: true,
      message: 'Data reset to baseline'
    });
  } catch (error) {
    console.error('[Server] Reset failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset database',
      error: error.message
    });
  }
});

/**
 * Pagination middleware
 * Intercepts GET requests to list endpoints and wraps responses in PaginatedResponse format
 */
server.use((req, res, next) => {
  // Only process GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Check if this is a list endpoint (not a single item with ID)
  const isListEndpoint =
    (req.path === '/products' || req.path === '/inventory') &&
    !req.path.match(/\/[^/]+\/[^/]+$/); // No /{resource}/{id} pattern

  if (!isListEndpoint) {
    return next();
  }

  console.log(`[Pagination] Intercepting ${req.path}`);

  // Mark this response as needing pagination wrapping
  res.locals.shouldPaginate = true;
  res.locals.paginationParams = {
    page: parseInt(req.query.page, 10) || 0,
    size: parseInt(req.query.size, 10) || 25
  };

  // Store filtering and sorting parameters
  res.locals.filterParams = {
    search: req.query.search || null,
    status: req.query.status || 'all',
    sort: req.query.sort || null,
    order: req.query.order || 'asc'
  };

  next();
});

// Response wrapper middleware - must come after pagination marker but before router
router.render = (req, res) => {
  let data = res.locals.data;

  // Check if this response should be paginated
  if (res.locals.shouldPaginate && Array.isArray(data)) {
    const { page, size } = res.locals.paginationParams;
    const { search, status, sort, order } = res.locals.filterParams || {};

    // Apply search filter (case-insensitive on name and sku)
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(item => {
        const nameMatch = item.name && item.name.toLowerCase().includes(searchLower);
        const skuMatch = item.sku && item.sku.toLowerCase().includes(searchLower);
        return nameMatch || skuMatch;
      });
      console.log(`[Filter] Search "${search}" matched ${data.length} items`);
    }

    // Apply status filter
    if (status && status !== 'all') {
      if (status === 'enabled') {
        data = data.filter(item => item.isEnabled === true);
      } else if (status === 'disabled') {
        data = data.filter(item => item.isEnabled === false);
      }
      console.log(`[Filter] Status "${status}" filtered to ${data.length} items`);
    }

    // Apply sorting
    if (sort) {
      const sortField = sort;
      const sortOrder = order === 'desc' ? -1 : 1;

      data = data.slice().sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        // Handle different types
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * sortOrder;
        }

        // Numeric or date comparison
        if (aVal < bVal) return -1 * sortOrder;
        if (aVal > bVal) return 1 * sortOrder;
        return 0;
      });
      console.log(`[Filter] Sorted by "${sortField}" ${order}`);
    }

    // Calculate pagination on filtered/sorted results
    const totalItems = data.length;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const results = data.slice(startIndex, endIndex);

    // Build paginated response
    const paginatedResponse = {
      totalItems,
      page,
      size,
      results
    };

    console.log(`[Pagination] Wrapping response: totalItems=${totalItems}, page=${page}, size=${size}, resultsCount=${results.length}`);

    res.jsonp(paginatedResponse);
  } else {
    // Default rendering
    res.jsonp(data);
  }
};

// Use router (must come after all middlewares)
server.use(router);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] JSON Server is running on port ${PORT}`);
  console.log(`[Server] Resources available:`);
  console.log(`  - http://localhost:${PORT}/api/products`);
  console.log(`  - http://localhost:${PORT}/api/inventory`);
});

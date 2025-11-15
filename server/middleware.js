/**
 * Middleware for json-server that wraps array responses in PaginatedResponse format
 * Handles pagination query params (page, size) and returns properly paginated data
 */

module.exports = (req, res, next) => {
  // Only process GET requests to list endpoints
  if (req.method !== 'GET') {
    return next();
  }

  // Store original json function
  const originalJson = res.json;

  // Override json function to intercept responses
  res.json = function(data) {
    console.log(`[Middleware] Path: ${req.path}, isArray: ${Array.isArray(data)}, dataLength: ${Array.isArray(data) ? data.length : 'N/A'}`);

    // Check if this is an array response that should be paginated
    // Match only list endpoints like /products (not /products/id)
    // Note: routes.json rewrites /api/products to /products BEFORE middleware runs
    const isListEndpoint =
      (req.path === '/products' || req.path === '/inventory') &&
      Array.isArray(data);

    if (isListEndpoint) {
      // Extract pagination params from query string
      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 25;

      // Calculate pagination
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

      console.log(`[Middleware] Returning paginated response: totalItems=${totalItems}, page=${page}, size=${size}, resultsLength=${results.length}`);

      // Send paginated response
      return originalJson.call(this, paginatedResponse);
    }

    // For non-array responses or single item endpoints, send as-is
    return originalJson.call(this, data);
  };

  next();
};

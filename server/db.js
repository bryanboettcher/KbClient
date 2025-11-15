/**
 * Database module for json-server
 * Loads and exports mock data from JSON files
 */

const products = require('./data/products.json');
const inventory = require('./data/inventory.json');

console.log('[DB] Loaded products:', products.length);
console.log('[DB] Loaded inventory:', inventory.length);

module.exports = () => {
  console.log('[DB] Creating database with products and inventory');
  return {
    products,
    inventory
  };
};

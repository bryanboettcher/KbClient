import { Product } from '../models';

export interface ProductFilterOptions {
  search?: string; // Filter by SKU or name
  status?: 'enabled' | 'disabled' | 'discontinued' | null;
  sortBy?: 'sku' | 'name' | 'quantity' | 'updatedOn';
  sortOrder?: 'asc' | 'desc';
}

export class ProductFilters {
  /**
   * Apply filters and sorting to a list of products
   * @param products - The products to filter
   * @param filters - Filter options to apply
   * @returns Filtered and sorted products
   * @throws Error if products is not a valid array
   */
  static apply(products: Product[], filters: ProductFilterOptions): Product[] {
    // Defensive validation: ensure products is iterable
    if (!products) {
      throw new Error('ProductFilters.apply: products parameter is null or undefined');
    }

    if (!Array.isArray(products)) {
      throw new Error(
        `ProductFilters.apply: products must be an array, received ${typeof products}`
      );
    }

    let results = [...products];

    // Handle null/undefined filters gracefully
    if (!filters) {
      return results;
    }

    // Search filter (SKU or name)
    if (filters.search) {
      const search = filters.search.toLowerCase().trim();
      results = results.filter(p => {
        const skuMatch = p.sku.toLowerCase().includes(search);
        const nameMatch = p.name?.toLowerCase().includes(search) || false;
        return skuMatch || nameMatch;
      });
    }

    // Status filter
    if (filters.status === 'enabled') {
      results = results.filter(p => p.isEnabled && p.isStocked);
    } else if (filters.status === 'disabled') {
      results = results.filter(p => !p.isEnabled && p.isStocked);
    } else if (filters.status === 'discontinued') {
      results = results.filter(p => !p.isStocked);
    }

    // Sorting
    if (filters.sortBy) {
      results = this.sort(results, filters.sortBy, filters.sortOrder || 'asc');
    }

    return results;
  }

  /**
   * Sort products by a specific field
   * @param products - The products to sort
   * @param field - The field to sort by
   * @param order - Sort order (ascending or descending)
   * @returns Sorted products
   */
  private static sort(
    products: Product[],
    field: 'sku' | 'name' | 'quantity' | 'updatedOn',
    order: 'asc' | 'desc'
  ): Product[] {
    const sorted = [...products].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'sku':
          comparison = a.sku.localeCompare(b.sku);
          break;
        case 'name':
          const aName = a.name || '';
          const bName = b.name || '';
          comparison = aName.localeCompare(bName);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'updatedOn':
          comparison = new Date(a.updatedOn).getTime() - new Date(b.updatedOn).getTime();
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }
}

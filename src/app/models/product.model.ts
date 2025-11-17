export interface ProductDimensions {
  width: number | null;
  length: number | null;
  height: number | null;
  weight: number | null;
}

export interface Product {
  productId: string;
  sku: string;
  name: string | null;
  dimensions: ProductDimensions | null;
  quantity: number;
  inventoryId: string | null;
  stockThreshold: number | null;
  leadTime: string | null; // ISO 8601 duration (e.g., "12:00:00")
  isStocked: boolean;
  isEnabled: boolean;
  isAvailable: boolean;
  createdOn: string; // ISO 8601 UTC (e.g., "2024-01-15T14:32:18.1234567Z")
  updatedOn: string; // ISO 8601 UTC
}

export interface PaginatedResponse<T> {
  totalItems: number; // Total across all pages
  page: number; // Zero-based
  size: number; // Items per page
  results: T[]; // Current page items
}

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

/**
 * Server-side query options for product filtering
 * Used to build query parameters for the products API endpoint
 */
export interface ProductQueryOptions {
  page?: number;
  size?: number;
  search?: string;
  status?: 'enabled' | 'disabled' | 'all';
  sort?: 'name' | 'sku' | 'quantity' | 'createdOn' | 'updatedOn';
  order?: 'asc' | 'desc';
}

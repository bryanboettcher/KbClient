import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  PaginatedResponse,
  ProductQueryOptions
} from '../models';
import { ProductFilters, ProductFilterOptions } from '../utils/product-filters';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends ApiService {
  private endpoint = 'products';

  /**
   * Get paginated products with server-side filtering and sorting
   * @param options - Query options for pagination, filtering, and sorting
   * @returns Observable of paginated product response
   */
  getProducts(options: ProductQueryOptions = {}): Observable<PaginatedResponse<Product>> {
    const url = this.buildProductQueryUrl(options);

    return this.get<PaginatedResponse<Product> | Product[]>(url).pipe(
      map(response => {
        // Normalize response: handle both paginated wrapper and raw array
        const page = options.page ?? 0;
        const size = options.size ?? 25;
        return this.normalizePaginatedResponse(response, page, size);
      })
    );
  }

  /**
   * Build URL with query parameters for products endpoint
   * @param options - Query options to convert to URL parameters
   * @returns Complete URL with query string
   */
  private buildProductQueryUrl(options: ProductQueryOptions): string {
    const params: string[] = [];

    // Always include pagination (with defaults)
    const page = options.page ?? 0;
    const size = options.size ?? 25;
    params.push(`page=${page}`);
    params.push(`size=${size}`);

    // Only include optional params if they have meaningful values
    if (options.search && options.search.trim()) {
      params.push(`search=${encodeURIComponent(options.search.trim())}`);
    }

    if (options.status && options.status !== 'all') {
      params.push(`status=${options.status}`);
    }

    if (options.sort) {
      params.push(`sort=${options.sort}`);
    }

    if (options.order) {
      params.push(`order=${options.order}`);
    }

    return `${this.endpoint}?${params.join('&')}`;
  }

  /**
   * Normalize API response to PaginatedResponse format
   * Handles both raw array responses and properly wrapped paginated responses
   * @param response - The raw API response
   * @param page - Current page number
   * @param size - Page size
   * @returns Normalized PaginatedResponse
   */
  private normalizePaginatedResponse(
    response: PaginatedResponse<Product> | Product[],
    page: number,
    size: number
  ): PaginatedResponse<Product> {
    // Case 1: Response is a raw array (middleware not applied)
    if (Array.isArray(response)) {
      this.logger.warn(
        'API returned raw array instead of paginated response. Wrapping automatically.'
      );
      return {
        totalItems: response.length,
        page: page,
        size: size,
        results: response
      };
    }

    // Case 2: Response is an object but missing required fields
    if (!response || typeof response !== 'object') {
      this.logger.error('API returned invalid response type', { responseType: typeof response });
      throw new Error('Invalid API response: expected paginated response object');
    }

    // Case 3: Response object exists but results is missing or invalid
    if (!('results' in response)) {
      this.logger.error('API response missing "results" property', { response });
      throw new Error('Invalid API response: missing "results" property');
    }

    if (!Array.isArray(response.results)) {
      this.logger.error('API response "results" is not an array', {
        resultsType: typeof response.results,
        results: response.results
      });
      throw new Error(
        `Invalid API response: "results" is not an array (got ${typeof response.results})`
      );
    }

    // Case 4: Valid paginated response
    return response;
  }

  getProduct(id: string): Observable<Product> {
    return this.get<Product>(`${this.endpoint}/${id}`);
  }

  createProduct(payload: CreateProductPayload): Observable<Product> {
    return this.post<Product>(this.endpoint, payload);
  }

  updateProduct(id: string, payload: UpdateProductPayload): Observable<Product> {
    return this.put<Product>(`${this.endpoint}/${id}`, payload);
  }

  deleteProduct(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  enableProduct(id: string): Observable<Product> {
    return this.post<Product>(`${this.endpoint}/${id}/enable`, {});
  }

  disableProduct(id: string): Observable<Product> {
    return this.post<Product>(`${this.endpoint}/${id}/disable`, {});
  }
}

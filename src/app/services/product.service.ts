import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product, CreateProductPayload, UpdateProductPayload, PaginatedResponse } from '../models';
import { ProductFilters, ProductFilterOptions } from '../utils/product-filters';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends ApiService {
  private endpoint = 'products';

  /**
   * Get paginated products with optional client-side filtering
   * @param page - Zero-based page number
   * @param size - Number of items per page
   * @param filters - Optional client-side filter options
   * @returns Observable of paginated product response
   */
  getProducts(
    page: number = 0,
    size: number = 25,
    filters?: ProductFilterOptions
  ): Observable<PaginatedResponse<Product>> {
    const url = `${this.endpoint}?page=${page}&size=${size}`;

    return this.get<PaginatedResponse<Product>>(url).pipe(
      map(response => {
        // Apply client-side filters if provided
        if (filters && Object.keys(filters).length > 0) {
          const filteredResults = ProductFilters.apply(response.results, filters);
          return {
            ...response,
            results: filteredResults,
            totalItems: filteredResults.length
          };
        }
        return response;
      })
    );
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

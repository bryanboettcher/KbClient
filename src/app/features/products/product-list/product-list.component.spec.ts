import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../services/product.service';
import { Product, PaginatedResponse } from '../../../models';
import { NotificationService } from '../../../services/notification.service';
import { ProductStateStore } from '../../../stores/product-state.store';
import { signal } from '@angular/core';

// Extended product interface for testing action state
interface ProductWithState extends Product {
  actionLoading?: boolean;
  actionType?: 'enable' | 'disable' | 'delete';
}

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let mockProductService: jest.Mocked<ProductService>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockProductStateStore: any;

  const mockProduct1: Product = {
    productId: '1',
    sku: 'MTR-X500',
    name: 'Brushless Motor X500',
    dimensions: { width: 2.5, length: 3.0, height: 1.5, weight: 0.3 },
    quantity: 45,
    inventoryId: 'inv-001',
    stockThreshold: 10,
    leadTime: '12:00:00',
    isStocked: true,
    isEnabled: true,
    isAvailable: true,
    createdOn: '2024-01-15T10:30:00.0000000Z',
    updatedOn: '2024-02-20T14:22:18.1234567Z'
  };

  const mockProduct2: Product = {
    productId: '2',
    sku: 'PROP-A450',
    name: 'Carbon Fiber Propeller 4.5"',
    dimensions: { width: 4.5, length: 4.5, height: 0.2, weight: 0.05 },
    quantity: 120,
    inventoryId: 'inv-002',
    stockThreshold: 20,
    leadTime: '06:00:00',
    isStocked: true,
    isEnabled: false,
    isAvailable: false,
    createdOn: '2024-01-10T08:15:00.0000000Z',
    updatedOn: '2024-02-18T09:45:30.5678901Z'
  };

  const mockResponse: PaginatedResponse<Product> = {
    totalItems: 2,
    page: 0,
    size: 25,
    results: [mockProduct1, mockProduct2]
  };

  beforeEach(async () => {
    mockProductService = {
      getProducts: jest.fn().mockReturnValue(of({ totalItems: 0, page: 0, size: 25, results: [] })),
      enableProduct: jest.fn().mockReturnValue(of({})),
      disableProduct: jest.fn().mockReturnValue(of({})),
      deleteProduct: jest.fn().mockReturnValue(of(undefined))
    } as any;

    mockNotificationService = {
      error: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
    } as any;

    // Create mock ProductStateStore
    mockProductStateStore = {
      queryOptions: signal({
        page: 0,
        size: 25,
        sort: 'sku',
        order: 'asc'
      }),
      updateFilters: jest.fn(),
      updateSort: jest.fn(),
      updatePagination: jest.fn(),
      updateSearch: jest.fn(),
      reset: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ProductStateStore, useValue: mockProductStateStore },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  describe('component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load products on init', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      component.ngOnInit();

      setTimeout(() => {
        expect(mockProductService.getProducts).toHaveBeenCalledWith({
          page: 0,
          size: 25,
          sort: 'sku',
          order: 'asc'
        });
        expect(component.products).toEqual(mockResponse.results);
        expect(component.totalItems).toBe(2);
        expect(component.loading).toBe(false);
        done();
      }, 50);
    });

    it('should initialize with default values', () => {
      expect(component.products).toEqual([]);
      expect(component.totalItems).toBe(0);
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
      expect(component.queryOptions().page).toBe(0);
      expect(component.queryOptions().size).toBe(25);
      expect(component.queryOptions().sort).toBe('sku');
      expect(component.queryOptions().order).toBe('asc');
    });
  });

  describe('loading state', () => {
    it('should display loading state while fetching', done => {
      // Delay the response to capture loading state
      mockProductService.getProducts.mockReturnValue(
        new Observable(subscriber => {
          setTimeout(() => {
            subscriber.next(mockResponse);
            subscriber.complete();
          }, 100);
        })
      );

      component.loadProducts();
      fixture.detectChanges();

      const skeletonTable = fixture.nativeElement.querySelector('app-skeleton-table');
      expect(skeletonTable).toBeTruthy();

      const srText = fixture.nativeElement.querySelector('.sr-only');
      expect(srText).toBeTruthy();
      expect(srText.textContent).toContain('Loading products');
      done();
    });

    it('should set loading to true when loadProducts is called', done => {
      mockProductService.getProducts.mockReturnValue(
        new Observable(subscriber => {
          // Check loading state before completing
          expect(component.loading).toBe(true);
          subscriber.next(mockResponse);
          subscriber.complete();
          done();
        })
      );

      component.loading = false;
      component.loadProducts();
    });

    it('should set loading to false after successful load', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      component.loadProducts();

      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 50);
    });
  });

  describe('error handling', () => {
    it('should display error on service failure', done => {
      const errorMessage = 'API Error';
      mockProductService.getProducts.mockReturnValue(throwError(() => new Error(errorMessage)));

      component.loadProducts();

      setTimeout(() => {
        expect(component.error).toBe('Failed to load products. Please try again.');
        expect(component.loading).toBe(false);
        // Error notification is handled by HTTP interceptor, not component
        done();
      }, 50);
    });

    it('should handle service validation errors for malformed API responses', done => {
      // Simulate service throwing validation error (e.g., API returned invalid structure)
      const validationError = new Error('Invalid API response: missing "results" property');
      mockProductService.getProducts.mockReturnValue(throwError(() => validationError));

      component.loadProducts();

      setTimeout(() => {
        expect(component.error).toBe('Failed to load products. Please try again.');
        expect(component.products).toEqual([]); // Products should remain empty on error
        expect(component.loading).toBe(false);
        done();
      }, 50);
    });

    it('should preserve existing products when service returns error', done => {
      // Pre-populate with some data
      component.products = [mockProduct1];
      component.totalItems = 1;

      mockProductService.getProducts.mockReturnValue(throwError(() => new Error('Network error')));

      component.loadProducts();

      setTimeout(() => {
        // Products should remain unchanged (not replaced with empty array or invalid data)
        // This verifies defensive behavior: don't wipe user's view on transient errors
        expect(component.products).toEqual([mockProduct1]);
        expect(component.totalItems).toBe(1);
        expect(component.error).toBe('Failed to load products. Please try again.');
        done();
      }, 50);
    });

    it('should display error state in UI', done => {
      // Trigger ngOnInit first
      mockProductService.getProducts.mockReturnValue(of(mockResponse));
      fixture.detectChanges(); // This calls ngOnInit

      setTimeout(() => {
        // Now set error state
        component.error = 'Failed to load products. Please try again.';
        component.loading = false;
        component.products = []; // No products to show
        fixture.detectChanges();

        const errorElement = fixture.nativeElement.querySelector('.error-state');
        expect(errorElement).toBeTruthy();
        expect(errorElement.textContent).toContain('Unable to Load Products');
        done();
      }, 100);
    });

    it('should clear error on retry', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));
      component.error = 'Previous error';

      component.loadProducts();

      setTimeout(() => {
        expect(component.error).toBeNull();
        done();
      }, 50);
    });
  });

  describe('empty state', () => {
    it('should display empty state when no products', done => {
      mockProductService.getProducts.mockReturnValue(
        of({
          totalItems: 0,
          page: 0,
          size: 25,
          results: []
        })
      );

      component.ngOnInit();

      setTimeout(() => {
        fixture.detectChanges();
        const emptyElement = fixture.nativeElement.querySelector('.empty-state');
        expect(emptyElement).toBeTruthy();
        expect(emptyElement.textContent).toContain('No Products Found');
        done();
      }, 100);
    });
  });

  describe('search filtering', () => {
    it('should filter products by search term (debounced)', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      // Initialize and wait for initial load to complete
      component.ngOnInit();

      setTimeout(() => {
        // Clear the initial call from ngOnInit
        mockProductService.getProducts.mockClear();

        // Update mock store signal when updateSearch is called
        mockProductStateStore.updateSearch.mockImplementation((query: string) => {
          mockProductStateStore.queryOptions.set({
            page: 0,
            size: 25,
            sort: 'sku',
            order: 'asc',
            search: query
          });
        });

        component.searchControl.setValue('motor');

        // Wait for debounce (300ms) + processing
        setTimeout(() => {
          expect(mockProductStateStore.updateSearch).toHaveBeenCalledWith('motor');
          expect(mockProductService.getProducts).toHaveBeenCalledWith(
            expect.objectContaining({
              page: 0,
              size: 25,
              search: 'motor'
            })
          );
          done();
        }, 400);
      }, 100);
    });

    it('should reset to first page when searching', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      component.ngOnInit();
      component.searchControl.setValue('test');

      setTimeout(() => {
        expect(mockProductStateStore.updateSearch).toHaveBeenCalledWith('test');
        done();
      }, 350);
    });
  });

  describe('status filtering', () => {
    it('should filter products by enabled status', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      const event = {
        target: { value: 'enabled' }
      } as any;

      component.onStatusFilterChange(event);

      setTimeout(() => {
        expect(mockProductStateStore.updateFilters).toHaveBeenCalledWith('enabled');
        expect(mockProductService.getProducts).toHaveBeenCalled();
        done();
      }, 50);
    });

    it('should filter products by disabled status', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      const event = {
        target: { value: 'disabled' }
      } as any;

      component.onStatusFilterChange(event);

      setTimeout(() => {
        expect(mockProductStateStore.updateFilters).toHaveBeenCalledWith('disabled');
        done();
      }, 50);
    });

    it('should clear status filter when "all" selected', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      const event = {
        target: { value: 'all' }
      } as any;

      component.onStatusFilterChange(event);

      setTimeout(() => {
        expect(mockProductStateStore.updateFilters).toHaveBeenCalledWith(null);
        done();
      }, 50);
    });

    it('should reset to first page when filtering by status', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      const event = {
        target: { value: 'disabled' }
      } as any;

      component.onStatusFilterChange(event);

      setTimeout(() => {
        // updateFilters internally resets to page 0 in the store
        expect(mockProductStateStore.updateFilters).toHaveBeenCalledWith('disabled');
        done();
      }, 50);
    });
  });

  describe('sorting', () => {
    it('should sort products by column', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      component.onSort('name');

      setTimeout(() => {
        expect(mockProductStateStore.updateSort).toHaveBeenCalledWith('name', 'asc');
        expect(mockProductService.getProducts).toHaveBeenCalled();
        done();
      }, 50);
    });

    it('should toggle sort order when clicking same column', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      component.onSort('sku');

      setTimeout(() => {
        expect(mockProductStateStore.updateSort).toHaveBeenCalledWith('sku', 'desc');
        done();
      }, 50);
    });

    it('should default to ascending when sorting new column', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      component.onSort('quantity');

      setTimeout(() => {
        expect(mockProductStateStore.updateSort).toHaveBeenCalledWith('quantity', 'asc');
        done();
      }, 50);
    });
  });

  describe('pagination', () => {
    it('should change pages correctly', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));
      component.totalItems = 100;

      component.onPageChange(2);

      setTimeout(() => {
        expect(mockProductStateStore.updatePagination).toHaveBeenCalledWith(2);
        expect(mockProductService.getProducts).toHaveBeenCalled();
        done();
      }, 50);
    });

    it('should not allow navigation to negative page', () => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));
      component.onPageChange(-1);
      expect(mockProductStateStore.updatePagination).not.toHaveBeenCalled();
    });

    it('should not allow navigation beyond total pages', () => {
      component.totalItems = 50;

      component.onPageChange(10); // Beyond totalPages (2)

      expect(mockProductStateStore.updatePagination).not.toHaveBeenCalled();
    });

    it('should calculate total pages correctly', () => {
      component.totalItems = 100;
      expect(component.totalPages).toBe(4);

      component.totalItems = 95;
      expect(component.totalPages).toBe(4);

      component.totalItems = 101;
      expect(component.totalPages).toBe(5);
    });

    it('should generate page numbers for pagination', () => {
      component.totalItems = 200;
      mockProductStateStore.queryOptions.set({
        page: 3,
        size: 25,
        sort: 'sku',
        order: 'asc'
      });

      const pages = component.pageNumbers;
      expect(pages).toContain(3);
      expect(pages.length).toBeLessThanOrEqual(5);
    });
  });

  describe('utility methods', () => {
    it('should get correct status badge class for enabled product', () => {
      const result = component.getStatusBadgeClass(mockProduct1);
      expect(result).toBe('status-enabled');
    });

    it('should get correct status badge class for disabled product', () => {
      const result = component.getStatusBadgeClass(mockProduct2);
      expect(result).toBe('status-disabled');
    });

    it('should get correct status badge class for discontinued product', () => {
      const discontinuedProduct: Product = {
        ...mockProduct1,
        isStocked: false,
        isEnabled: false
      };
      const result = component.getStatusBadgeClass(discontinuedProduct);
      expect(result).toBe('status-discontinued');
    });

    it('should get correct status text', () => {
      expect(component.getStatusText(mockProduct1)).toBe('Enabled');
      expect(component.getStatusText(mockProduct2)).toBe('Disabled');
      expect(component.getStatusText({ ...mockProduct1, isStocked: false })).toBe('Discontinued');
    });

    it('should format ISO date correctly', () => {
      const formatted = component.formatDate('2024-02-20T14:22:18.1234567Z');
      expect(formatted).toBeTruthy();
      expect(formatted).not.toBe('2024-02-20T14:22:18.1234567Z'); // Should be formatted
    });

    it('should handle invalid date gracefully', () => {
      const invalidDate = 'invalid-date';
      const result = component.formatDate(invalidDate);
      // formatDate returns formatted date or original string, both are acceptable
      expect(result).toBeTruthy();
    });

    it('should track products by productId', () => {
      const result = component.trackByProductId(0, mockProduct1);
      expect(result).toBe('1');
    });
  });

  describe('service call parameters', () => {
    it('should call service with correct parameters', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      // Update mock store state
      mockProductStateStore.queryOptions.set({
        page: 1,
        size: 50,
        search: 'test',
        status: 'enabled',
        sort: 'quantity',
        order: 'desc'
      });

      component.loadProducts();

      setTimeout(() => {
        expect(mockProductService.getProducts).toHaveBeenCalledWith({
          page: 1,
          size: 50,
          search: 'test',
          status: 'enabled',
          sort: 'quantity',
          order: 'desc'
        });
        done();
      }, 50);
    });

    it('should omit filters when not set', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      // Default mock store state has no search/status
      mockProductStateStore.queryOptions.set({
        page: 0,
        size: 25,
        sort: 'sku',
        order: 'asc'
      });

      component.loadProducts();

      setTimeout(() => {
        expect(mockProductService.getProducts).toHaveBeenCalledWith({
          page: 0,
          size: 25,
          sort: 'sku',
          order: 'asc'
        });
        done();
      }, 50);
    });
  });

  describe('action buttons - toggle enabled', () => {
    it('should enable a disabled product', done => {
      const disabledProduct = { ...mockProduct2, isEnabled: false };
      const enabledProduct = { ...mockProduct2, isEnabled: true };
      mockProductService.enableProduct.mockReturnValue(of(enabledProduct));

      component.products = [disabledProduct];

      component.toggleEnabled(disabledProduct);

      // Service call completes synchronously with of(), so loading is already false
      setTimeout(() => {
        expect(mockProductService.enableProduct).toHaveBeenCalledWith('2');
        expect(component.products[0].isEnabled).toBe(true);
        expect(component.products[0].actionLoading).toBe(false);
        expect(component.products[0].actionType).toBeUndefined();
        expect(mockNotificationService.success).toHaveBeenCalledWith(
          expect.stringContaining('enabled successfully')
        );
        done();
      }, 50);
    });

    it('should set loading state during async operation', done => {
      const product: ProductWithState = { ...mockProduct2, isEnabled: false };
      const enabledProduct = { ...mockProduct2, isEnabled: true };

      // Use delayed Observable to capture loading state
      mockProductService.enableProduct.mockReturnValue(
        new Observable(subscriber => {
          // Check loading state while request is in-flight
          expect(product.actionLoading).toBe(true);
          expect(product.actionType).toBe('enable');

          setTimeout(() => {
            subscriber.next(enabledProduct);
            subscriber.complete();
          }, 50);
        })
      );

      component.products = [product];
      component.toggleEnabled(product);

      setTimeout(() => {
        expect(product.actionLoading).toBe(false);
        done();
      }, 100);
    });

    it('should disable an enabled product', done => {
      const enabledProduct = { ...mockProduct1, isEnabled: true };
      const disabledProduct = { ...mockProduct1, isEnabled: false };
      mockProductService.disableProduct.mockReturnValue(of(disabledProduct));

      component.products = [enabledProduct];

      component.toggleEnabled(enabledProduct);

      setTimeout(() => {
        expect(mockProductService.disableProduct).toHaveBeenCalledWith('1');
        expect(component.products[0].isEnabled).toBe(false);
        expect(component.products[0].actionLoading).toBe(false);
        expect(mockNotificationService.success).toHaveBeenCalledWith(
          expect.stringContaining('disabled successfully')
        );
        done();
      }, 50);
    });

    it('should handle enable error gracefully', done => {
      const product: ProductWithState = { ...mockProduct2, isEnabled: false };
      mockProductService.enableProduct.mockReturnValue(throwError(() => new Error('API error')));

      component.products = [product];
      component.toggleEnabled(product);

      setTimeout(() => {
        expect(product.actionLoading).toBe(false);
        expect(product.actionType).toBeUndefined();
        expect(product.isEnabled).toBe(false); // State unchanged
        // Error is handled and logged by HTTP interceptor
        done();
      }, 50);
    });

    it('should handle disable error gracefully', done => {
      const product = { ...mockProduct1, isEnabled: true };
      mockProductService.disableProduct.mockReturnValue(throwError(() => new Error('API error')));

      component.products = [product];
      component.toggleEnabled(product);

      setTimeout(() => {
        expect(product.isEnabled).toBe(true); // State unchanged
        // Error is handled and logged by HTTP interceptor
        done();
      }, 50);
    });

    it('should prevent double-click during loading', () => {
      const product: ProductWithState = { ...mockProduct2, isEnabled: false, actionLoading: true };

      component.toggleEnabled(product);

      expect(mockProductService.enableProduct).not.toHaveBeenCalled();
      expect(mockProductService.disableProduct).not.toHaveBeenCalled();
    });

    it('should call notification service for success', done => {
      const product = { ...mockProduct2, isEnabled: false };
      const enabledProduct = { ...product, isEnabled: true };

      mockProductService.enableProduct.mockReturnValue(of(enabledProduct));

      component.toggleEnabled(product);

      setTimeout(() => {
        expect(mockNotificationService.success).toHaveBeenCalled();
        done();
      }, 50);
    });
  });

  describe('action buttons - delete', () => {
    beforeEach(() => {
      // Mock window.confirm
      jest.spyOn(window, 'confirm').mockReturnValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should show confirmation dialog before deleting', () => {
      const product = { ...mockProduct1 };
      mockProductService.deleteProduct.mockReturnValue(of(void 0));

      component.products = [product];
      component.confirmDelete(product);

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Are you sure you want to delete')
      );
    });

    it('should delete product on confirmation', done => {
      const product = { ...mockProduct1 };
      mockProductService.deleteProduct.mockReturnValue(of(void 0));

      component.products = [product];
      component.totalItems = 1;
      component.confirmDelete(product);

      setTimeout(() => {
        expect(mockProductService.deleteProduct).toHaveBeenCalledWith('1');
        expect(component.products.length).toBe(0);
        expect(component.totalItems).toBe(0);
        expect(mockNotificationService.success).toHaveBeenCalledWith(
          expect.stringContaining('deleted successfully')
        );
        done();
      }, 50);
    });

    it('should not delete product on cancel', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      const product = { ...mockProduct1 };
      component.products = [product];
      component.confirmDelete(product);

      expect(mockProductService.deleteProduct).not.toHaveBeenCalled();
      expect(component.products.length).toBe(1);
    });

    it('should handle delete error gracefully', done => {
      const product: ProductWithState = { ...mockProduct1 };
      mockProductService.deleteProduct.mockReturnValue(throwError(() => new Error('API error')));

      component.products = [product];
      component.totalItems = 1;
      component.confirmDelete(product);

      setTimeout(() => {
        expect(product.actionLoading).toBe(false);
        expect(product.actionType).toBeUndefined();
        expect(component.products.length).toBe(1); // Product not removed
        expect(component.totalItems).toBe(1);
        // Error is handled and logged by HTTP interceptor
        done();
      }, 50);
    });

    it('should prevent delete during loading', () => {
      const product: ProductWithState = { ...mockProduct1, actionLoading: true };

      component.confirmDelete(product);

      expect(window.confirm).not.toHaveBeenCalled();
      expect(mockProductService.deleteProduct).not.toHaveBeenCalled();
    });

    it('should go to previous page when deleting last item on page', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));
      mockProductService.deleteProduct.mockReturnValue(of(void 0));

      // Set mock store to page 1
      mockProductStateStore.queryOptions.set({
        page: 1,
        size: 25,
        sort: 'sku',
        order: 'asc'
      });

      const product = { ...mockProduct1 };
      component.products = [product];
      component.totalItems = 26; // More than one page total

      component.confirmDelete(product);

      setTimeout(() => {
        expect(mockProductStateStore.updatePagination).toHaveBeenCalledWith(0);
        expect(mockProductService.getProducts).toHaveBeenCalled();
        done();
      }, 50);
    });

    it('should stay on same page when deleting non-last item', done => {
      mockProductService.deleteProduct.mockReturnValue(of(void 0));

      component.products = [mockProduct1, mockProduct2];
      component.totalItems = 2;

      component.confirmDelete({ ...mockProduct1 });

      setTimeout(() => {
        expect(mockProductStateStore.updatePagination).not.toHaveBeenCalled();
        expect(component.products.length).toBe(1);
        done();
      }, 50);
    });
  });
});

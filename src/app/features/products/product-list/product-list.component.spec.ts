import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, Observable } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../services/product.service';
import { Product, PaginatedResponse } from '../../../models';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let mockProductService: jest.Mocked<ProductService>;

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
      getProducts: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [{ provide: ProductService, useValue: mockProductService }]
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
        expect(mockProductService.getProducts).toHaveBeenCalledWith(0, 25, {
          sortBy: 'sku',
          sortOrder: 'asc'
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
      expect(component.currentPage).toBe(0);
      expect(component.pageSize).toBe(25);
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
      expect(component.statusFilter).toBeNull();
      expect(component.sortBy).toBe('sku');
      expect(component.sortOrder).toBe('asc');
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

      const loadingElement = fixture.nativeElement.querySelector('.loading-state');
      expect(loadingElement).toBeTruthy();
      expect(loadingElement.textContent).toContain('Loading products');
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
        expect(errorElement.textContent).toContain('Error Loading Products');
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

        component.searchControl.setValue('motor');

        // Wait for debounce (300ms) + processing
        setTimeout(() => {
          expect(mockProductService.getProducts).toHaveBeenCalledWith(
            0,
            25,
            expect.objectContaining({ search: 'motor' })
          );
          done();
        }, 400);
      }, 100);
    });

    it('should reset to first page when searching', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));
      component.currentPage = 2;

      component.ngOnInit();
      component.searchControl.setValue('test');

      setTimeout(() => {
        expect(component.currentPage).toBe(0);
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
        expect(component.statusFilter).toBe('enabled');
        expect(mockProductService.getProducts).toHaveBeenCalledWith(
          0,
          25,
          expect.objectContaining({ status: 'enabled' })
        );
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
        expect(component.statusFilter).toBe('disabled');
        done();
      }, 50);
    });

    it('should clear status filter when "all" selected', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));
      component.statusFilter = 'enabled';

      const event = {
        target: { value: 'all' }
      } as any;

      component.onStatusFilterChange(event);

      setTimeout(() => {
        expect(component.statusFilter).toBeNull();
        done();
      }, 50);
    });

    it('should reset to first page when filtering by status', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));
      component.currentPage = 3;

      const event = {
        target: { value: 'disabled' }
      } as any;

      component.onStatusFilterChange(event);

      setTimeout(() => {
        expect(component.currentPage).toBe(0);
        done();
      }, 50);
    });
  });

  describe('sorting', () => {
    it('should sort products by column', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      component.onSort('name');

      setTimeout(() => {
        expect(component.sortBy).toBe('name');
        expect(component.sortOrder).toBe('asc');
        expect(mockProductService.getProducts).toHaveBeenCalledWith(
          0,
          25,
          expect.objectContaining({ sortBy: 'name', sortOrder: 'asc' })
        );
        done();
      }, 50);
    });

    it('should toggle sort order when clicking same column', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));
      component.sortBy = 'sku';
      component.sortOrder = 'asc';

      component.onSort('sku');

      setTimeout(() => {
        expect(component.sortOrder).toBe('desc');
        done();
      }, 50);
    });

    it('should default to ascending when sorting new column', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));
      component.sortBy = 'sku';
      component.sortOrder = 'desc';

      component.onSort('quantity');

      setTimeout(() => {
        expect(component.sortBy).toBe('quantity');
        expect(component.sortOrder).toBe('asc');
        done();
      }, 50);
    });
  });

  describe('pagination', () => {
    it('should change pages correctly', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));
      component.totalItems = 100;
      component.pageSize = 25;

      component.onPageChange(2);

      setTimeout(() => {
        expect(component.currentPage).toBe(2);
        expect(mockProductService.getProducts).toHaveBeenCalledWith(2, 25, expect.any(Object));
        done();
      }, 50);
    });

    it('should not allow navigation to negative page', () => {
      const initialPage = component.currentPage;
      component.onPageChange(-1);
      expect(component.currentPage).toBe(initialPage);
    });

    it('should not allow navigation beyond total pages', () => {
      component.totalItems = 50;
      component.pageSize = 25;
      component.currentPage = 0;

      component.onPageChange(10); // Beyond totalPages (2)

      expect(component.currentPage).toBe(0); // Should not change
    });

    it('should calculate total pages correctly', () => {
      component.totalItems = 100;
      component.pageSize = 25;
      expect(component.totalPages).toBe(4);

      component.totalItems = 95;
      expect(component.totalPages).toBe(4);

      component.totalItems = 101;
      expect(component.totalPages).toBe(5);
    });

    it('should generate page numbers for pagination', () => {
      component.totalItems = 200;
      component.pageSize = 25;
      component.currentPage = 3;

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

      component.currentPage = 1;
      component.pageSize = 50;
      component.searchControl.setValue('test');
      component.statusFilter = 'enabled';
      component.sortBy = 'quantity';
      component.sortOrder = 'desc';

      component.loadProducts();

      setTimeout(() => {
        expect(mockProductService.getProducts).toHaveBeenCalledWith(1, 50, {
          search: 'test',
          status: 'enabled',
          sortBy: 'quantity',
          sortOrder: 'desc'
        });
        done();
      }, 50);
    });

    it('should omit filters when not set', done => {
      mockProductService.getProducts.mockReturnValue(of(mockResponse));

      component.searchControl.setValue('');
      component.statusFilter = null;

      component.loadProducts();

      setTimeout(() => {
        expect(mockProductService.getProducts).toHaveBeenCalledWith(0, 25, {
          sortBy: 'sku',
          sortOrder: 'asc'
        });
        done();
      }, 50);
    });
  });
});

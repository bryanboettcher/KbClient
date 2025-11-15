import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ProductService } from './product.service';
import { CreateProductPayload, UpdateProductPayload, Product, PaginatedResponse } from '../models';
import { NGXLogger } from 'ngx-logger';

/**
 * Unit tests for ProductService
 *
 * Philosophy:
 * - Test pure logic with mocked dependencies
 * - Verify service calls HttpClient with correct parameters
 * - Test error handling paths
 * - No exhaustive validation testing (that's component's job)
 */
describe('ProductService', () => {
  let service: ProductService;
  let httpClientMock: jest.Mocked<HttpClient>;
  let loggerMock: jest.Mocked<NGXLogger>;

  const mockProduct: Product = {
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

  beforeEach(() => {
    // Create mock HttpClient
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    } as any;

    // Create mock logger
    loggerMock = {
      error: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: HttpClient, useValue: httpClientMock },
        { provide: NGXLogger, useValue: loggerMock }
      ]
    });

    service = TestBed.inject(ProductService);
  });

  describe('getProducts', () => {
    it('should call GET /products with pagination parameters', done => {
      const mockResponse: PaginatedResponse<Product> = {
        totalItems: 2,
        page: 0,
        size: 25,
        results: [mockProduct, mockProduct2]
      };
      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getProducts(0, 25).subscribe(response => {
        expect(httpClientMock.get).toHaveBeenCalledWith(
          'http://localhost:5000/api/products?page=0&size=25'
        );
        expect(response).toEqual(mockResponse);
        expect(response.results).toHaveLength(2);
        done();
      });
    });

    it('should use default pagination parameters when not provided', done => {
      const mockResponse: PaginatedResponse<Product> = {
        totalItems: 1,
        page: 0,
        size: 25,
        results: [mockProduct]
      };
      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getProducts().subscribe(response => {
        expect(httpClientMock.get).toHaveBeenCalledWith(
          'http://localhost:5000/api/products?page=0&size=25'
        );
        expect(response.results).toHaveLength(1);
        done();
      });
    });

    it('should apply client-side search filter', done => {
      const mockResponse: PaginatedResponse<Product> = {
        totalItems: 2,
        page: 0,
        size: 25,
        results: [mockProduct, mockProduct2]
      };
      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getProducts(0, 25, { search: 'motor' }).subscribe(response => {
        expect(response.results).toHaveLength(1);
        expect(response.results[0].sku).toBe('MTR-X500');
        expect(response.totalItems).toBe(1); // totalItems updated to reflect filtered count
        done();
      });
    });

    it('should apply client-side status filter', done => {
      const mockResponse: PaginatedResponse<Product> = {
        totalItems: 2,
        page: 0,
        size: 25,
        results: [mockProduct, mockProduct2]
      };
      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getProducts(0, 25, { status: 'enabled' }).subscribe(response => {
        expect(response.results).toHaveLength(1);
        expect(response.results[0].isEnabled).toBe(true);
        expect(response.results[0].isStocked).toBe(true);
        done();
      });
    });

    it('should apply client-side sorting', done => {
      const mockResponse: PaginatedResponse<Product> = {
        totalItems: 2,
        page: 0,
        size: 25,
        results: [mockProduct, mockProduct2]
      };
      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getProducts(0, 25, { sortBy: 'sku', sortOrder: 'asc' }).subscribe(response => {
        expect(response.results).toHaveLength(2);
        expect(response.results[0].sku).toBe('MTR-X500');
        expect(response.results[1].sku).toBe('PROP-A450');
        done();
      });
    });

    it('should not modify response when no filters provided', done => {
      const mockResponse: PaginatedResponse<Product> = {
        totalItems: 2,
        page: 0,
        size: 25,
        results: [mockProduct, mockProduct2]
      };
      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getProducts(0, 25, {}).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.totalItems).toBe(2);
        done();
      });
    });
  });

  describe('getProduct', () => {
    it('should call GET /products/:id with correct ID', done => {
      httpClientMock.get.mockReturnValue(of(mockProduct));

      service.getProduct('1').subscribe(product => {
        expect(httpClientMock.get).toHaveBeenCalledWith('http://localhost:5000/api/products/1');
        expect(product).toEqual(mockProduct);
        done();
      });
    });
  });

  describe('createProduct', () => {
    it('should call POST /products with payload', done => {
      const payload: CreateProductPayload = {
        name: 'RC Motor X500',
        description: 'High-performance motor',
        sku: 'MTR-X500',
        price: 29.99
      };

      httpClientMock.post.mockReturnValue(of(mockProduct));

      service.createProduct(payload).subscribe(product => {
        expect(httpClientMock.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/products',
          payload
        );
        expect(product).toEqual(mockProduct);
        done();
      });
    });

    it('should handle error response', done => {
      const payload: CreateProductPayload = {
        name: 'RC Motor X500',
        sku: 'MTR-X500'
      };

      const errorResponse = new Error('Server error');
      httpClientMock.post.mockReturnValue(throwError(() => errorResponse));

      service.createProduct(payload).subscribe({
        next: () => fail('Should have errored'),
        error: error => {
          expect(error).toBeDefined();
          done();
        }
      });
    });
  });

  describe('updateProduct', () => {
    it('should call PUT /products/:id with payload', done => {
      const payload: UpdateProductPayload = {
        name: 'Updated Motor Name',
        price: 39.99
      };

      const updatedProduct = { ...mockProduct, ...payload };
      httpClientMock.put.mockReturnValue(of(updatedProduct));

      service.updateProduct('1', payload).subscribe(product => {
        expect(httpClientMock.put).toHaveBeenCalledWith(
          'http://localhost:5000/api/products/1',
          payload
        );
        expect(product).toEqual(updatedProduct);
        done();
      });
    });
  });

  describe('deleteProduct', () => {
    it('should call DELETE /products/:id', done => {
      httpClientMock.delete.mockReturnValue(of(undefined));

      service.deleteProduct('1').subscribe(() => {
        expect(httpClientMock.delete).toHaveBeenCalledWith('http://localhost:5000/api/products/1');
        done();
      });
    });
  });

  describe('enableProduct', () => {
    it('should call POST /products/:id/enable', done => {
      const enabledProduct = { ...mockProduct, enabled: true };
      httpClientMock.post.mockReturnValue(of(enabledProduct));

      service.enableProduct('1').subscribe(product => {
        expect(httpClientMock.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/products/1/enable',
          {}
        );
        expect(product.enabled).toBe(true);
        done();
      });
    });
  });

  describe('disableProduct', () => {
    it('should call POST /products/:id/disable', done => {
      const disabledProduct = { ...mockProduct, enabled: false };
      httpClientMock.post.mockReturnValue(of(disabledProduct));

      service.disableProduct('1').subscribe(product => {
        expect(httpClientMock.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/products/1/disable',
          {}
        );
        expect(product.enabled).toBe(false);
        done();
      });
    });
  });
});

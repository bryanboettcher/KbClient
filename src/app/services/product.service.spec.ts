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
    describe('query string building', () => {
      it('should build URL with default pagination when no options provided', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 2,
          page: 0,
          size: 25,
          results: [mockProduct, mockProduct2]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts().subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25'
          );
          done();
        });
      });

      it('should build URL with custom pagination', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 100,
          page: 2,
          size: 50,
          results: [mockProduct]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ page: 2, size: 50 }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=2&size=50'
          );
          done();
        });
      });

      it('should include search parameter when provided', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 1,
          page: 0,
          size: 25,
          results: [mockProduct]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ search: 'motor' }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25&search=motor'
          );
          done();
        });
      });

      it('should URL-encode search parameter with special characters', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 0,
          page: 0,
          size: 25,
          results: []
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ search: 'motor & prop' }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25&search=motor%20%26%20prop'
          );
          done();
        });
      });

      it('should trim whitespace from search parameter', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 1,
          page: 0,
          size: 25,
          results: [mockProduct]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ search: '  motor  ' }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25&search=motor'
          );
          done();
        });
      });

      it('should not include empty search parameter', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 2,
          page: 0,
          size: 25,
          results: [mockProduct, mockProduct2]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ search: '   ' }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25'
          );
          done();
        });
      });

      it('should include status parameter when set to enabled', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 1,
          page: 0,
          size: 25,
          results: [mockProduct]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ status: 'enabled' }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25&status=enabled'
          );
          done();
        });
      });

      it('should include status parameter when set to disabled', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 1,
          page: 0,
          size: 25,
          results: [mockProduct2]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ status: 'disabled' }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25&status=disabled'
          );
          done();
        });
      });

      it('should not include status parameter when set to all', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 2,
          page: 0,
          size: 25,
          results: [mockProduct, mockProduct2]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ status: 'all' }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25'
          );
          done();
        });
      });

      it('should include sort parameter', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 2,
          page: 0,
          size: 25,
          results: [mockProduct, mockProduct2]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ sort: 'name' }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25&sort=name'
          );
          done();
        });
      });

      it('should include order parameter', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 2,
          page: 0,
          size: 25,
          results: [mockProduct2, mockProduct]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ order: 'desc' }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25&order=desc'
          );
          done();
        });
      });

      it('should include both sort and order parameters', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 2,
          page: 0,
          size: 25,
          results: [mockProduct, mockProduct2]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ sort: 'sku', order: 'asc' }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25&sort=sku&order=asc'
          );
          done();
        });
      });

      it('should build complete URL with all parameters', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 1,
          page: 1,
          size: 10,
          results: [mockProduct]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service
          .getProducts({
            page: 1,
            size: 10,
            search: 'motor',
            status: 'enabled',
            sort: 'quantity',
            order: 'desc'
          })
          .subscribe(() => {
            expect(httpClientMock.get).toHaveBeenCalledWith(
              'http://localhost:5000/api/products?page=1&size=10&search=motor&status=enabled&sort=quantity&order=desc'
            );
            done();
          });
      });

      it('should support createdOn sort field', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 2,
          page: 0,
          size: 25,
          results: [mockProduct, mockProduct2]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ sort: 'createdOn' }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25&sort=createdOn'
          );
          done();
        });
      });

      it('should support updatedOn sort field', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 2,
          page: 0,
          size: 25,
          results: [mockProduct, mockProduct2]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts({ sort: 'updatedOn' }).subscribe(() => {
          expect(httpClientMock.get).toHaveBeenCalledWith(
            'http://localhost:5000/api/products?page=0&size=25&sort=updatedOn'
          );
          done();
        });
      });
    });

    describe('response handling', () => {
      it('should return paginated response as-is when valid', done => {
        const mockResponse: PaginatedResponse<Product> = {
          totalItems: 2,
          page: 0,
          size: 25,
          results: [mockProduct, mockProduct2]
        };
        httpClientMock.get.mockReturnValue(of(mockResponse));

        service.getProducts().subscribe(response => {
          expect(response).toEqual(mockResponse);
          expect(response.results).toHaveLength(2);
          done();
        });
      });

      it('should normalize raw array response to paginated format', done => {
        // Simulate json-server returning raw array (middleware not applied)
        const rawArrayResponse = [mockProduct, mockProduct2];
        httpClientMock.get.mockReturnValue(of(rawArrayResponse));

        service.getProducts().subscribe(response => {
          expect(response.results).toHaveLength(2);
          expect(response.totalItems).toBe(2);
          expect(response.page).toBe(0);
          expect(response.size).toBe(25);
          expect(loggerMock.warn).toHaveBeenCalledWith(
            'API returned raw array instead of paginated response. Wrapping automatically.'
          );
          done();
        });
      });

      it('should use provided page/size for normalized raw array response', done => {
        const rawArrayResponse = [mockProduct];
        httpClientMock.get.mockReturnValue(of(rawArrayResponse));

        service.getProducts({ page: 3, size: 10 }).subscribe(response => {
          expect(response.page).toBe(3);
          expect(response.size).toBe(10);
          done();
        });
      });

      it('should handle empty raw array response', done => {
        const emptyArrayResponse: Product[] = [];
        httpClientMock.get.mockReturnValue(of(emptyArrayResponse));

        service.getProducts().subscribe(response => {
          expect(response.results).toHaveLength(0);
          expect(response.totalItems).toBe(0);
          expect(response.page).toBe(0);
          expect(response.size).toBe(25);
          done();
        });
      });

      it('should handle valid paginated response with additional properties', done => {
        const responseWithExtras = {
          totalItems: 2,
          page: 0,
          size: 25,
          results: [mockProduct, mockProduct2],
          extraProperty: 'should be ignored',
          anotherExtra: 123
        };
        httpClientMock.get.mockReturnValue(of(responseWithExtras));

        service.getProducts().subscribe(response => {
          expect(response.results).toHaveLength(2);
          expect(response.totalItems).toBe(2);
          done();
        });
      });
    });

    describe('error handling', () => {
      it('should throw error when response is missing results property', done => {
        const invalidResponse = { totalItems: 2, page: 0, size: 25 }; // Missing results
        httpClientMock.get.mockReturnValue(of(invalidResponse));

        service.getProducts().subscribe({
          next: () => fail('Should have errored'),
          error: error => {
            expect(error.message).toContain('missing "results" property');
            expect(loggerMock.error).toHaveBeenCalled();
            done();
          }
        });
      });

      it('should throw error when results is not an array', done => {
        const invalidResponse = { totalItems: 2, page: 0, size: 25, results: 'not an array' };
        httpClientMock.get.mockReturnValue(of(invalidResponse));

        service.getProducts().subscribe({
          next: () => fail('Should have errored'),
          error: error => {
            expect(error.message).toContain('results" is not an array');
            expect(loggerMock.error).toHaveBeenCalled();
            done();
          }
        });
      });

      it('should throw error when response is null', done => {
        httpClientMock.get.mockReturnValue(of(null));

        service.getProducts().subscribe({
          next: () => fail('Should have errored'),
          error: error => {
            expect(error.message).toContain('Invalid API response');
            expect(loggerMock.error).toHaveBeenCalled();
            done();
          }
        });
      });

      it('should throw error when response is undefined', done => {
        httpClientMock.get.mockReturnValue(of(undefined));

        service.getProducts().subscribe({
          next: () => fail('Should have errored'),
          error: error => {
            expect(error.message).toContain('Invalid API response');
            expect(loggerMock.error).toHaveBeenCalled();
            done();
          }
        });
      });

      it('should throw error when response is a primitive string', done => {
        httpClientMock.get.mockReturnValue(of('not a valid response' as any));

        service.getProducts().subscribe({
          next: () => fail('Should have errored'),
          error: error => {
            expect(error.message).toContain('Invalid API response');
            done();
          }
        });
      });

      it('should throw error when response is a number', done => {
        httpClientMock.get.mockReturnValue(of(42 as any));

        service.getProducts().subscribe({
          next: () => fail('Should have errored'),
          error: error => {
            expect(error.message).toContain('Invalid API response');
            done();
          }
        });
      });

      it('should throw error when results property is null', done => {
        const invalidResponse = { totalItems: 2, page: 0, size: 25, results: null };
        httpClientMock.get.mockReturnValue(of(invalidResponse));

        service.getProducts().subscribe({
          next: () => fail('Should have errored'),
          error: error => {
            expect(error.message).toContain('not an array');
            expect(loggerMock.error).toHaveBeenCalled();
            done();
          }
        });
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
      const enabledProduct = { ...mockProduct, isEnabled: true };
      httpClientMock.post.mockReturnValue(of(enabledProduct));

      service.enableProduct('1').subscribe(product => {
        expect(httpClientMock.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/products/1/enable',
          {}
        );
        expect(product.isEnabled).toBe(true);
        done();
      });
    });
  });

  describe('disableProduct', () => {
    it('should call POST /products/:id/disable', done => {
      const disabledProduct = { ...mockProduct, isEnabled: false };
      httpClientMock.post.mockReturnValue(of(disabledProduct));

      service.disableProduct('1').subscribe(product => {
        expect(httpClientMock.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/products/1/disable',
          {}
        );
        expect(product.isEnabled).toBe(false);
        done();
      });
    });
  });
});

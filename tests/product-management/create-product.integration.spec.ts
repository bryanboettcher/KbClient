import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { http, HttpResponse } from 'msw';
import { ProductService } from '@services/product.service';
import { server } from '../setup/msw-server';
import { resetStores } from '../setup/handlers';

/**
 * Integration test: Create Product Workflow
 *
 * Philosophy:
 * - Test multi-service workflows with MSW fake backend
 * - Given/When/Then structure for readability
 * - Assert on observable results (not exhaustive UI state)
 * - Focus on business requirements, not implementation details
 */
describe('Create Product Workflow', () => {
  let productService: ProductService;

  beforeEach(() => {
    // Reset MSW data stores to initial state
    resetStores();

    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        importProvidersFrom(LoggerModule.forRoot({ level: NgxLoggerLevel.OFF }))
      ]
    });

    productService = TestBed.inject(ProductService);
  });

  it('should create product and return with generated ID', done => {
    // Given: User wants to create a new product
    const newProduct = {
      name: 'RC Battery Pack 3000mAh',
      description: 'High-capacity LiPo battery',
      sku: 'BAT-3000',
      price: 49.99
    };

    // When: Product is created via API
    productService.createProduct(newProduct).subscribe(createdProduct => {
      // Then: Product is created with ID and defaults
      expect(createdProduct.id).toBeDefined();
      expect(createdProduct.name).toBe(newProduct.name);
      expect(createdProduct.sku).toBe(newProduct.sku);
      expect(createdProduct.price).toBe(newProduct.price);
      expect(createdProduct.enabled).toBe(true);
      expect(createdProduct.createdAt).toBeDefined();

      done();
    });
  });

  it('should create product and verify it appears in product list', done => {
    // Given: A new product is created
    const newProduct = {
      name: 'RC Servo Motor SG90',
      description: 'Micro servo for RC models',
      sku: 'SRV-SG90',
      price: 5.99
    };

    // When: Product is created and then list is fetched
    productService.createProduct(newProduct).subscribe(() => {
      productService.getProducts().subscribe(products => {
        // Then: New product appears in the list
        const foundProduct = products.find(p => p.sku === 'SRV-SG90');
        expect(foundProduct).toBeDefined();
        expect(foundProduct?.name).toBe(newProduct.name);
        expect(foundProduct?.price).toBe(newProduct.price);

        done();
      });
    });
  });

  it('should handle server error during product creation', done => {
    // Given: Server will return an error
    server.use(
      http.post('http://localhost:5000/api/products', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const newProduct = {
      name: 'RC Propeller 10x4.5',
      sku: 'PROP-1045'
    };

    // When: Attempting to create product
    productService.createProduct(newProduct).subscribe({
      next: () => fail('Should have thrown an error'),
      error: error => {
        // Then: Error is properly handled
        expect(error).toBeDefined();
        done();
      }
    });
  });

  it('should create product with minimal fields', done => {
    // Given: User provides only required fields
    const minimalProduct = {
      name: 'RC Wheel Set'
    };

    // When: Product is created
    productService.createProduct(minimalProduct).subscribe(createdProduct => {
      // Then: Product is created successfully
      expect(createdProduct.id).toBeDefined();
      expect(createdProduct.name).toBe(minimalProduct.name);
      expect(createdProduct.enabled).toBe(true);

      done();
    });
  });

  it('should enable and disable product after creation', done => {
    // Given: A product exists
    const newProduct = {
      name: 'RC ESC 30A',
      sku: 'ESC-30A',
      price: 19.99
    };

    // When: Product is created, disabled, then enabled
    productService.createProduct(newProduct).subscribe(created => {
      const productId = created.id;

      productService.disableProduct(productId).subscribe(disabled => {
        // Then: Product is disabled
        expect(disabled.enabled).toBe(false);

        productService.enableProduct(productId).subscribe(enabled => {
          // Then: Product is enabled again
          expect(enabled.enabled).toBe(true);
          done();
        });
      });
    });
  });
});

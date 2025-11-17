import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../services/product.service';
import { NotificationService } from '../../../services/notification.service';
import { Product } from '../../../models';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let mockProductService: jest.Mocked<ProductService>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;

  const mockProduct: Product = {
    productId: 'test-id-123',
    sku: 'TEST-SKU-001',
    name: 'Test Product',
    dimensions: {
      width: 10,
      length: 20,
      height: 5,
      weight: 1.5
    },
    quantity: 100,
    inventoryId: 'inv-001',
    stockThreshold: 10,
    leadTime: '72:00:00',
    isStocked: true,
    isEnabled: true,
    isAvailable: true,
    createdOn: '2024-01-01T00:00:00.0000000Z',
    updatedOn: '2024-01-01T00:00:00.0000000Z'
  };

  beforeEach(async () => {
    mockProductService = {
      getProduct: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn()
    } as any;

    mockNotificationService = {
      success: jest.fn(),
      error: jest.fn()
    } as any;

    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with default values in create mode', () => {
      fixture.detectChanges();

      expect(component.mode).toBe('create');
      expect(component.form.get('sku')?.value).toBe('');
      expect(component.form.get('quantity')?.value).toBe(0);
      expect(component.form.get('isStocked')?.value).toBe(true);
      expect(component.form.get('isEnabled')?.value).toBe(true);
      expect(component.form.get('isAvailable')?.value).toBe(true);
    });

    it('should load product data in edit mode', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('test-id-123');
      mockProductService.getProduct.mockReturnValue(of(mockProduct));

      fixture.detectChanges();

      expect(component.mode).toBe('edit');
      expect(component.productId).toBe('test-id-123');
      expect(mockProductService.getProduct).toHaveBeenCalledWith('test-id-123');
      expect(component.form.get('sku')?.value).toBe('TEST-SKU-001');
      expect(component.form.get('name')?.value).toBe('Test Product');
      expect(component.form.get('quantity')?.value).toBe(100);
    });

    it('should navigate to products list when product not found in edit mode', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('non-existent-id');
      mockProductService.getProduct.mockReturnValue(
        throwError(() => new Error('Product not found'))
      );

      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should require SKU field', () => {
      const skuControl = component.form.get('sku');

      skuControl?.setValue('');
      expect(skuControl?.valid).toBe(false);
      expect(skuControl?.errors?.['required']).toBe(true);

      skuControl?.setValue('VALID-SKU');
      expect(skuControl?.valid).toBe(true);
    });

    it('should require quantity field', () => {
      const quantityControl = component.form.get('quantity');

      quantityControl?.setValue(null);
      expect(quantityControl?.valid).toBe(false);
      expect(quantityControl?.errors?.['required']).toBe(true);

      quantityControl?.setValue(10);
      expect(quantityControl?.valid).toBe(true);
    });

    it('should validate quantity minimum value', () => {
      const quantityControl = component.form.get('quantity');

      quantityControl?.setValue(-1);
      expect(quantityControl?.valid).toBe(false);
      expect(quantityControl?.errors?.['min']).toBeTruthy();

      quantityControl?.setValue(0);
      expect(quantityControl?.valid).toBe(true);
    });

    it('should validate dimension minimum values', () => {
      const dimensionsGroup = component.form.get('dimensions');
      const widthControl = dimensionsGroup?.get('width');

      widthControl?.setValue(-5);
      expect(widthControl?.valid).toBe(false);
      expect(widthControl?.errors?.['min']).toBeTruthy();

      widthControl?.setValue(0);
      expect(widthControl?.valid).toBe(true);
    });

    it('should validate leadTime format', () => {
      const leadTimeControl = component.form.get('leadTime');

      leadTimeControl?.setValue('invalid-format');
      expect(leadTimeControl?.valid).toBe(false);
      expect(leadTimeControl?.errors?.['pattern']).toBeTruthy();

      leadTimeControl?.setValue('72:00:00');
      expect(leadTimeControl?.valid).toBe(true);

      leadTimeControl?.setValue('12:30:45');
      expect(leadTimeControl?.valid).toBe(true);
    });

    it('should consider form valid when only required fields are filled', () => {
      component.form.patchValue({
        sku: 'VALID-SKU',
        quantity: 10
      });

      expect(component.form.valid).toBe(true);
    });

    it('should consider form invalid when required fields are missing', () => {
      component.form.patchValue({
        sku: '',
        quantity: 10
      });

      expect(component.form.valid).toBe(false);
    });
  });

  describe('Form Submission - Create Mode', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create product with valid form data', () => {
      const formData = {
        sku: 'NEW-SKU-001',
        name: 'New Product',
        dimensions: { width: 10, length: 20, height: 5, weight: 1.5 },
        quantity: 50,
        inventoryId: 'inv-002',
        stockThreshold: 5,
        leadTime: '48:00:00',
        isStocked: true,
        isEnabled: true,
        isAvailable: true
      };

      component.form.patchValue(formData);
      mockProductService.createProduct.mockReturnValue(of({ ...mockProduct, ...formData }));

      component.onSubmit();

      expect(mockProductService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          sku: 'NEW-SKU-001',
          name: 'New Product',
          quantity: 50
        })
      );
      expect(mockNotificationService.success).toHaveBeenCalledWith(
        expect.stringContaining('created successfully')
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should not submit when form is invalid', () => {
      component.form.patchValue({ sku: '', quantity: -1 });

      component.onSubmit();

      expect(mockProductService.createProduct).not.toHaveBeenCalled();
      expect(component.form.touched).toBe(true); // Form should be marked as touched to show validation errors
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      component.form.patchValue({ sku: '' });

      component.onSubmit();

      expect(component.form.get('sku')?.touched).toBe(true);
      expect(mockProductService.createProduct).not.toHaveBeenCalled();
    });

    it('should set loading state during submission', () => {
      component.form.patchValue({ sku: 'TEST-SKU', quantity: 10 });
      mockProductService.createProduct.mockReturnValue(of(mockProduct));

      expect(component.loading).toBe(false);

      component.onSubmit();

      expect(component.loading).toBe(false); // Synchronously completes in test
    });

    it('should handle creation errors gracefully', () => {
      component.form.patchValue({ sku: 'TEST-SKU', quantity: 10 });
      mockProductService.createProduct.mockReturnValue(throwError(() => new Error('Server error')));

      component.onSubmit();

      expect(component.loading).toBe(false);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission - Edit Mode', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('test-id-123');
      mockProductService.getProduct.mockReturnValue(of(mockProduct));
      fixture.detectChanges();
    });

    it('should update product with modified form data', () => {
      component.form.patchValue({ name: 'Updated Product Name', quantity: 150 });

      const updatedProduct = { ...mockProduct, name: 'Updated Product Name', quantity: 150 };
      mockProductService.updateProduct.mockReturnValue(of(updatedProduct));

      component.onSubmit();

      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        'test-id-123',
        expect.objectContaining({
          sku: 'TEST-SKU-001',
          name: 'Updated Product Name',
          quantity: 150
        })
      );
      expect(mockNotificationService.success).toHaveBeenCalledWith(
        expect.stringContaining('updated successfully')
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should handle update errors gracefully', () => {
      component.form.patchValue({ name: 'Updated Name' });
      mockProductService.updateProduct.mockReturnValue(throwError(() => new Error('Server error')));

      component.onSubmit();

      expect(component.loading).toBe(false);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Action', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate back to products list when cancel is clicked', () => {
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return correct page title for create mode', () => {
      component.mode = 'create';
      expect(component.pageTitle).toBe('Create Product');
    });

    it('should return correct page title for edit mode', () => {
      component.mode = 'edit';
      expect(component.pageTitle).toBe('Edit Product');
    });

    it('should identify invalid touched fields correctly', () => {
      const skuControl = component.form.get('sku');

      skuControl?.setValue('');
      skuControl?.markAsTouched();

      expect(component.isFieldInvalid('sku')).toBe(true);

      skuControl?.setValue('VALID-SKU');
      expect(component.isFieldInvalid('sku')).toBe(false);
    });

    it('should return appropriate error messages for field validation errors', () => {
      const skuControl = component.form.get('sku');

      skuControl?.setValue('');
      skuControl?.markAsTouched();

      const error = component.getFieldError('sku');
      expect(error).toContain('required');
    });

    it('should return leadTime format error message', () => {
      const leadTimeControl = component.form.get('leadTime');

      leadTimeControl?.setValue('invalid');
      leadTimeControl?.markAsTouched();

      const error = component.getFieldError('leadTime');
      expect(error).toContain('HH:MM:SS');
    });

    it('should return min value error message', () => {
      const quantityControl = component.form.get('quantity');

      quantityControl?.setValue(-1);
      quantityControl?.markAsTouched();

      const error = component.getFieldError('quantity');
      expect(error).toContain('>=');
    });
  });

  describe('Dimension Group Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate all dimension fields independently', () => {
      const dimensionsGroup = component.form.get('dimensions');

      dimensionsGroup?.patchValue({
        width: -1,
        length: 10,
        height: null,
        weight: 5
      });

      expect(dimensionsGroup?.get('width')?.valid).toBe(false);
      expect(dimensionsGroup?.get('length')?.valid).toBe(true);
      expect(dimensionsGroup?.get('height')?.valid).toBe(true); // null is allowed
      expect(dimensionsGroup?.get('weight')?.valid).toBe(true);
    });

    it('should allow null values for optional dimension fields', () => {
      const dimensionsGroup = component.form.get('dimensions');

      dimensionsGroup?.patchValue({
        width: null,
        length: null,
        height: null,
        weight: null
      });

      expect(dimensionsGroup?.valid).toBe(true);
    });
  });
});

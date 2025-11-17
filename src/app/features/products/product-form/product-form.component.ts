import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../services/product.service';
import { NotificationService } from '../../../services/notification.service';
import { Product } from '../../../models';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    CardModule
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  mode: 'create' | 'edit' = 'create';
  productId: string | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.initializeForm();

    // Determine mode based on route params
    this.productId = this.route.snapshot.paramMap.get('id');
    this.mode = this.productId ? 'edit' : 'create';

    if (this.mode === 'edit' && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(1)]],
      name: [null],
      dimensions: this.fb.group({
        width: [null, [Validators.min(0)]],
        length: [null, [Validators.min(0)]],
        height: [null, [Validators.min(0)]],
        weight: [null, [Validators.min(0)]]
      }),
      quantity: [0, [Validators.required, Validators.min(0)]],
      inventoryId: [null],
      stockThreshold: [null, [Validators.min(0)]],
      leadTime: [null, [Validators.pattern(/^\d{2}:\d{2}:\d{2}$/)]],
      isStocked: [true],
      isEnabled: [true],
      isAvailable: [true]
    });
  }

  private loadProduct(id: string): void {
    this.loading = true;

    this.productService
      .getProduct(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product: Product) => {
          this.form.patchValue({
            sku: product.sku,
            name: product.name,
            dimensions: product.dimensions || {
              width: null,
              length: null,
              height: null,
              weight: null
            },
            quantity: product.quantity,
            inventoryId: product.inventoryId,
            stockThreshold: product.stockThreshold,
            leadTime: product.leadTime,
            isStocked: product.isStocked,
            isEnabled: product.isEnabled,
            isAvailable: product.isAvailable
          });
          this.loading = false;
        },
        error: () => {
          // Error already handled by interceptor
          this.loading = false;
          // Navigate back to list if product not found
          this.router.navigate(['/products']);
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading) {
      // Mark all fields as touched to show validation errors
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.form.value;

    // Build payload matching Product structure (excluding server-generated fields)
    const payload = {
      sku: formValue.sku,
      name: formValue.name,
      dimensions: formValue.dimensions,
      quantity: formValue.quantity,
      inventoryId: formValue.inventoryId,
      stockThreshold: formValue.stockThreshold,
      leadTime: formValue.leadTime,
      isStocked: formValue.isStocked,
      isEnabled: formValue.isEnabled,
      isAvailable: formValue.isAvailable
    };

    const operation =
      this.mode === 'create'
        ? this.productService.createProduct(payload)
        : this.productService.updateProduct(this.productId!, payload);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (product: Product) => {
        this.loading = false;
        const action = this.mode === 'create' ? 'created' : 'updated';
        this.notificationService.success(
          `Product "${product.sku}" has been ${action} successfully.`
        );
        this.router.navigate(['/products']);
      },
      error: () => {
        // Error already handled by interceptor
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  get pageTitle(): string {
    return this.mode === 'create' ? 'Create Product' : 'Edit Product';
  }

  // Helper methods for validation error display
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    if (field.errors['min']) {
      return `${this.getFieldLabel(fieldName)} must be >= ${field.errors['min'].min}`;
    }
    if (field.errors['pattern']) {
      if (fieldName === 'leadTime') {
        return 'Lead time must be in format HH:MM:SS (e.g., 72:00:00)';
      }
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      sku: 'SKU',
      name: 'Name',
      quantity: 'Quantity',
      inventoryId: 'Inventory ID',
      stockThreshold: 'Stock Threshold',
      leadTime: 'Lead Time',
      'dimensions.width': 'Width',
      'dimensions.length': 'Length',
      'dimensions.height': 'Height',
      'dimensions.weight': 'Weight'
    };
    return labels[fieldName] || fieldName;
  }
}

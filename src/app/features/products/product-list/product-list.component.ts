import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models';
import { NotificationService } from '../../../services/notification.service';
import { ProductStateStore } from '../../../stores/product-state.store';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';

// Skeleton components
import { SkeletonTableComponent } from '../../../components/skeleton-table/skeleton-table.component';

// Extended product with UI state for row-level actions
interface ProductWithState extends Product {
  actionLoading?: boolean;
  actionType?: 'enable' | 'disable' | 'delete';
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    SkeletonTableComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: ProductWithState[] = [];
  totalItems = 0;
  loading = false;
  error: string | null = null;

  searchControl = new FormControl('');

  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);
  readonly productStateStore = inject(ProductStateStore);

  // Expose store's computed queryOptions for component use
  readonly queryOptions = this.productStateStore.queryOptions;

  ngOnInit(): void {
    // Initialize search control with stored value
    this.searchControl.setValue(this.queryOptions().search || '');

    this.loadProducts();

    // Debounced search
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        this.productStateStore.updateSearch(value || '');
        this.loadProducts();
      });
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts(this.queryOptions()).subscribe({
      next: response => {
        this.products = response.results;
        this.totalItems = response.totalItems;
        this.loading = false;
        this.error = null;
      },
      error: () => {
        // Error is already handled and logged by HTTP interceptor
        // Just update local state
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
      }
    });
  }

  onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;

    const status = value === 'all' ? null : (value as 'enabled' | 'disabled');
    this.productStateStore.updateFilters(status);
    this.loadProducts();
  }

  onSort(column: 'sku' | 'name' | 'quantity' | 'updatedOn'): void {
    const currentOptions = this.queryOptions();
    const newOrder =
      currentOptions.sort === column && currentOptions.order === 'asc' ? 'desc' : 'asc';

    this.productStateStore.updateSort(column, newOrder);
    this.loadProducts();
  }

  onPageChange(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }

    this.productStateStore.updatePagination(page);
    this.loadProducts();
  }

  get totalPages(): number {
    const size = this.queryOptions().size ?? 25;
    return Math.ceil(this.totalItems / size);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const halfRange = Math.floor(maxPagesToShow / 2);
    const currentPage = this.queryOptions().page ?? 0;

    let startPage = Math.max(0, currentPage - halfRange);
    let endPage = Math.min(this.totalPages - 1, currentPage + halfRange);

    // Adjust if we're at the beginning or end
    if (currentPage < halfRange) {
      endPage = Math.min(this.totalPages - 1, maxPagesToShow - 1);
    }

    if (currentPage > this.totalPages - halfRange - 1) {
      startPage = Math.max(0, this.totalPages - maxPagesToShow);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getStatusBadgeClass(product: Product): string {
    if (!product.isStocked) {
      return 'status-discontinued';
    }
    return product.isEnabled ? 'status-enabled' : 'status-disabled';
  }

  getStatusText(product: Product): string {
    if (!product.isStocked) {
      return 'Discontinued';
    }
    return product.isEnabled ? 'Enabled' : 'Disabled';
  }

  formatDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString();
    } catch {
      return isoDate;
    }
  }

  trackByProductId(index: number, product: Product): string {
    return product.productId;
  }

  toggleEnabled(product: ProductWithState): void {
    if (product.actionLoading) {
      return;
    }

    const action = product.isEnabled ? 'disable' : 'enable';

    product.actionLoading = true;
    product.actionType = action;

    const serviceCall = product.isEnabled
      ? this.productService.disableProduct(product.productId)
      : this.productService.enableProduct(product.productId);

    serviceCall.subscribe({
      next: updatedProduct => {
        // Update local state with response
        Object.assign(product, updatedProduct);
        product.actionLoading = false;
        product.actionType = undefined;

        this.notificationService.success(
          `Product "${product.sku}" has been ${action}d successfully.`
        );
      },
      error: () => {
        // Error is already handled and logged by HTTP interceptor
        product.actionLoading = false;
        product.actionType = undefined;
      }
    });
  }

  confirmDelete(product: ProductWithState): void {
    if (product.actionLoading) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.sku}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      this.deleteProductAction(product);
    }
  }

  private deleteProductAction(product: ProductWithState): void {
    product.actionLoading = true;
    product.actionType = 'delete';

    this.productService.deleteProduct(product.productId).subscribe({
      next: () => {
        // Remove from local array
        const index = this.products.findIndex(p => p.productId === product.productId);
        if (index !== -1) {
          this.products.splice(index, 1);
          this.totalItems = Math.max(0, this.totalItems - 1);
        }

        this.notificationService.success(`Product "${product.sku}" has been deleted successfully.`);

        // If we deleted the last item on the page, go to previous page
        const currentPage = this.queryOptions().page ?? 0;
        if (this.products.length === 0 && currentPage > 0) {
          this.productStateStore.updatePagination(currentPage - 1);
          this.loadProducts();
        }
      },
      error: () => {
        // Error is already handled and logged by HTTP interceptor
        product.actionLoading = false;
        product.actionType = undefined;
      }
    });
  }
}

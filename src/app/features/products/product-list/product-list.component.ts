import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../../services/product.service';
import { Product, ProductQueryOptions } from '../../../models';
import { NotificationService } from '../../../services/notification.service';

// Extended product with UI state for row-level actions
interface ProductWithState extends Product {
  actionLoading?: boolean;
  actionType?: 'enable' | 'disable' | 'delete';
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: ProductWithState[] = [];
  totalItems = 0;
  currentPage = 0;
  pageSize = 25;
  loading = false;
  error: string | null = null;

  searchControl = new FormControl('');
  statusFilter: 'enabled' | 'disabled' | null = null;
  sortBy: 'sku' | 'name' | 'quantity' | 'updatedOn' = 'sku';
  sortOrder: 'asc' | 'desc' = 'asc';

  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.loadProducts();

    // Debounced search
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 0; // Reset to first page on search
        this.loadProducts();
      });
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    const options: ProductQueryOptions = {
      page: this.currentPage,
      size: this.pageSize
    };

    if (this.searchControl.value) {
      options.search = this.searchControl.value;
    }

    if (this.statusFilter) {
      options.status = this.statusFilter;
    }

    if (this.sortBy) {
      options.sort = this.sortBy;
      options.order = this.sortOrder;
    }

    this.productService.getProducts(options).subscribe({
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

    if (value === 'all') {
      this.statusFilter = null;
    } else {
      this.statusFilter = value as 'enabled' | 'disabled';
    }

    this.currentPage = 0; // Reset to first page on filter change
    this.loadProducts();
  }

  onSort(column: 'sku' | 'name' | 'quantity' | 'updatedOn'): void {
    if (this.sortBy === column) {
      // Toggle sort order
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortBy = column;
      this.sortOrder = 'asc';
    }

    this.loadProducts();
  }

  onPageChange(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.loadProducts();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const halfRange = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(0, this.currentPage - halfRange);
    let endPage = Math.min(this.totalPages - 1, this.currentPage + halfRange);

    // Adjust if we're at the beginning or end
    if (this.currentPage < halfRange) {
      endPage = Math.min(this.totalPages - 1, maxPagesToShow - 1);
    }

    if (this.currentPage > this.totalPages - halfRange - 1) {
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
        if (this.products.length === 0 && this.currentPage > 0) {
          this.currentPage--;
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

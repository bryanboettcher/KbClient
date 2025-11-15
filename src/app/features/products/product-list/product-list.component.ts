import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models';
import { ProductFilterOptions } from '../../../utils/product-filters';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  totalItems = 0;
  currentPage = 0;
  pageSize = 25;
  loading = false;
  error: string | null = null;

  searchControl = new FormControl('');
  statusFilter: 'enabled' | 'disabled' | 'discontinued' | null = null;
  sortBy: 'sku' | 'name' | 'quantity' | 'updatedOn' = 'sku';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(private productService: ProductService) {}

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

    const filters: ProductFilterOptions = {};

    if (this.searchControl.value) {
      filters.search = this.searchControl.value;
    }

    if (this.statusFilter) {
      filters.status = this.statusFilter;
    }

    if (this.sortBy) {
      filters.sortBy = this.sortBy;
      filters.sortOrder = this.sortOrder;
    }

    this.productService.getProducts(this.currentPage, this.pageSize, filters).subscribe({
      next: response => {
        this.products = response.results;
        this.totalItems = response.totalItems;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;

    if (value === 'all') {
      this.statusFilter = null;
    } else {
      this.statusFilter = value as 'enabled' | 'disabled' | 'discontinued';
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
}

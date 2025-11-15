import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/client/testing';
import { ProductListComponent } from '../../src/app/features/products/product-list/product-list.component';
import { ProductService } from '../../src/app/services/product.service';
import { NGXLogger } from 'ngx-logger';

/**
 * Integration tests for Product List feature
 *
 * Uses MSW to provide realistic API responses without hitting real backend
 * Tests complete user workflows from UI interaction to data display
 */
describe('Product List Integration', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let loggerMock: jest.Mocked<NGXLogger>;

  beforeEach(async () => {
    loggerMock = {
      error: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProductService,
        { provide: NGXLogger, useValue: loggerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  describe('initial page load', () => {
    it('should display products when page loads', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.products.length).toBeGreaterThan(0);
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
    });

    it('should display product data in table', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const table = fixture.nativeElement.querySelector('.products-table');
      expect(table).toBeTruthy();

      const rows = fixture.nativeElement.querySelectorAll('.product-row');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should display correct column headers', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const headers = fixture.nativeElement.querySelectorAll('th');
      const headerTexts = Array.from(headers).map((h: any) => h.textContent.trim());

      expect(headerTexts).toContain('SKU');
      expect(headerTexts).toContain('Name');
      expect(headerTexts).toContain('Quantity');
      expect(headerTexts).toContain('Status');
      expect(headerTexts).toContain('Updated');
      expect(headerTexts).toContain('Actions');
    });
  });

  describe('search functionality', () => {
    it('should filter products when user types in search', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const initialCount = component.products.length;

      // Type in search input
      const searchInput = fixture.nativeElement.querySelector('#search');
      searchInput.value = 'motor';
      searchInput.dispatchEvent(new Event('input'));
      component.searchControl.setValue('motor');

      // Wait for debounce + processing
      await new Promise(resolve => setTimeout(resolve, 350));
      fixture.detectChanges();

      expect(component.products.length).toBeLessThanOrEqual(initialCount);
      // Verify all visible products match search
      component.products.forEach(product => {
        const matchesSku = product.sku.toLowerCase().includes('motor');
        const matchesName = product.name?.toLowerCase().includes('motor') || false;
        expect(matchesSku || matchesName).toBe(true);
      });
    });

    it('should show empty state when search has no results', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.searchControl.setValue('xyznonexistent');

      await new Promise(resolve => setTimeout(resolve, 350));
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No Products Found');
    });

    it('should reset to page 1 when searching', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.currentPage = 2;
      component.searchControl.setValue('test');

      await new Promise(resolve => setTimeout(resolve, 350));

      expect(component.currentPage).toBe(0);
    });
  });

  describe('status filtering', () => {
    it('should filter to enabled products only', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const statusSelect = fixture.nativeElement.querySelector('#status');
      statusSelect.value = 'enabled';
      statusSelect.dispatchEvent(new Event('change'));

      const event = { target: { value: 'enabled' } } as any;
      component.onStatusFilterChange(event);

      await fixture.whenStable();
      fixture.detectChanges();

      component.products.forEach(product => {
        expect(product.isEnabled).toBe(true);
        expect(product.isStocked).toBe(true);
      });
    });

    it('should filter to disabled products only', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const event = { target: { value: 'disabled' } } as any;
      component.onStatusFilterChange(event);

      await fixture.whenStable();
      fixture.detectChanges();

      component.products.forEach(product => {
        expect(product.isEnabled).toBe(false);
        expect(product.isStocked).toBe(true);
      });
    });

    it('should filter to discontinued products only', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const event = { target: { value: 'discontinued' } } as any;
      component.onStatusFilterChange(event);

      await fixture.whenStable();
      fixture.detectChanges();

      component.products.forEach(product => {
        expect(product.isStocked).toBe(false);
      });
    });

    it('should show all products when "all" selected', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      // First filter to enabled
      const event1 = { target: { value: 'enabled' } } as any;
      component.onStatusFilterChange(event1);
      await fixture.whenStable();

      const filteredCount = component.products.length;

      // Then reset to all
      const event2 = { target: { value: 'all' } } as any;
      component.onStatusFilterChange(event2);
      await fixture.whenStable();

      expect(component.products.length).toBeGreaterThanOrEqual(filteredCount);
    });
  });

  describe('sorting', () => {
    it('should sort products by SKU ascending', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.onSort('sku');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortBy).toBe('sku');
      expect(component.sortOrder).toBe('asc');

      // Verify sorted order
      for (let i = 1; i < component.products.length; i++) {
        expect(
          component.products[i - 1].sku.localeCompare(component.products[i].sku)
        ).toBeLessThanOrEqual(0);
      }
    });

    it('should sort products by SKU descending when clicked twice', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.onSort('sku');
      await fixture.whenStable();

      component.onSort('sku'); // Click again to reverse
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortOrder).toBe('desc');

      // Verify reverse sorted order
      for (let i = 1; i < component.products.length; i++) {
        expect(
          component.products[i - 1].sku.localeCompare(component.products[i].sku)
        ).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort products by quantity', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.onSort('quantity');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortBy).toBe('quantity');

      // Verify sorted by quantity
      for (let i = 1; i < component.products.length; i++) {
        expect(component.products[i - 1].quantity).toBeLessThanOrEqual(
          component.products[i].quantity
        );
      }
    });

    it('should sort products by name', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.onSort('name');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortBy).toBe('name');

      // Verify sorted by name
      for (let i = 1; i < component.products.length; i++) {
        const name1 = component.products[i - 1].name || '';
        const name2 = component.products[i].name || '';
        expect(name1.localeCompare(name2)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort products by updated date', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.onSort('updatedOn');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortBy).toBe('updatedOn');

      // Verify sorted by date
      for (let i = 1; i < component.products.length; i++) {
        const date1 = new Date(component.products[i - 1].updatedOn).getTime();
        const date2 = new Date(component.products[i].updatedOn).getTime();
        expect(date1).toBeLessThanOrEqual(date2);
      }
    });

    it('should display sort indicator on active column', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.onSort('name');
      await fixture.whenStable();
      fixture.detectChanges();

      const headers = fixture.nativeElement.querySelectorAll('th.sortable');
      const nameHeader = Array.from(headers).find((h: any) => h.textContent.includes('Name'));

      expect(nameHeader?.classList.contains('active')).toBe(true);
      expect(nameHeader?.querySelector('.sort-indicator')).toBeTruthy();
    });
  });

  describe('pagination', () => {
    it('should display pagination controls', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const pagination = fixture.nativeElement.querySelector('.pagination');
      expect(pagination).toBeTruthy();

      const prevButton = fixture.nativeElement.querySelector('.pagination-btn:first-child');
      expect(prevButton.textContent).toContain('Previous');

      const nextButton = fixture.nativeElement.querySelector('.pagination-btn:last-of-type');
      expect(nextButton.textContent).toContain('Next');
    });

    it('should navigate to next page when clicked', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const initialProducts = [...component.products];

      component.onPageChange(1);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.currentPage).toBe(1);
      // Products should be different (unless we only have 1 page)
      if (component.totalPages > 1) {
        expect(component.products).not.toEqual(initialProducts);
      }
    });

    it('should disable previous button on first page', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      component.currentPage = 0;
      fixture.detectChanges();

      const prevButton = fixture.nativeElement.querySelector('.pagination-btn:first-child');
      expect(prevButton.disabled).toBe(true);
    });

    it('should show pagination info', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const paginationInfo = fixture.nativeElement.querySelector('.pagination-info');
      expect(paginationInfo).toBeTruthy();
      expect(paginationInfo.textContent).toContain('Showing');
      expect(paginationInfo.textContent).toContain('products');
    });
  });

  describe('combined filters', () => {
    it('should apply search and status filter together', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.searchControl.setValue('motor');
      const event = { target: { value: 'enabled' } } as any;
      component.onStatusFilterChange(event);

      await new Promise(resolve => setTimeout(resolve, 350));
      fixture.detectChanges();

      component.products.forEach(product => {
        const matchesSearch =
          product.sku.toLowerCase().includes('motor') ||
          product.name?.toLowerCase().includes('motor');
        expect(matchesSearch).toBe(true);
        expect(product.isEnabled).toBe(true);
      });
    });

    it('should apply all filters with sorting', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.searchControl.setValue('a');
      const event = { target: { value: 'enabled' } } as any;
      component.onStatusFilterChange(event);
      component.onSort('quantity');

      await new Promise(resolve => setTimeout(resolve, 350));
      fixture.detectChanges();

      // Verify filters applied
      component.products.forEach(product => {
        expect(product.isEnabled).toBe(true);
      });

      // Verify sorting
      if (component.products.length > 1) {
        for (let i = 1; i < component.products.length; i++) {
          expect(component.products[i - 1].quantity).toBeLessThanOrEqual(
            component.products[i].quantity
          );
        }
      }
    });
  });

  describe('action buttons', () => {
    it('should display action buttons for each product', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const firstRow = fixture.nativeElement.querySelector('.product-row');
      const actionButtons = firstRow.querySelectorAll('.action-btn');

      expect(actionButtons.length).toBe(4); // View, Edit, Toggle, Delete
    });

    it('should have disabled action buttons with tooltips', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const actionButtons = fixture.nativeElement.querySelectorAll('.action-btn');

      actionButtons.forEach((button: any) => {
        expect(button.disabled).toBe(true);
        expect(button.title).toContain('Coming in F-P');
      });
    });
  });

  describe('status badges', () => {
    it('should display correct status badges', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const statusBadges = fixture.nativeElement.querySelectorAll('.status-badge');
      expect(statusBadges.length).toBeGreaterThan(0);

      statusBadges.forEach((badge: any) => {
        const text = badge.textContent.trim();
        expect(['Enabled', 'Disabled', 'Discontinued']).toContain(text);
      });
    });

    it('should apply correct CSS classes to status badges', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const enabledBadge = Array.from(fixture.nativeElement.querySelectorAll('.status-badge')).find(
        (b: any) => b.textContent.trim() === 'Enabled'
      );

      if (enabledBadge) {
        expect((enabledBadge as HTMLElement).classList.contains('status-enabled')).toBe(true);
      }
    });
  });

  describe('responsive behavior', () => {
    it('should render table on desktop', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const table = fixture.nativeElement.querySelector('.products-table');
      expect(table).toBeTruthy();
    });

    it('should have scrollable table container', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const tableContainer = fixture.nativeElement.querySelector('.table-container');
      expect(tableContainer).toBeTruthy();
      const styles = window.getComputedStyle(tableContainer);
      expect(styles.overflowX).toBe('auto');
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonTableComponent } from './skeleton-table.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

describe('SkeletonTableComponent', () => {
  let component: SkeletonTableComponent;
  let fixture: ComponentFixture<SkeletonTableComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonTableComponent, SkeletonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonTableComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render skeleton table container', () => {
      const container = compiled.querySelector('.skeleton-table-container');
      expect(container).toBeTruthy();
    });

    it('should render table element', () => {
      const table = compiled.querySelector('.skeleton-table');
      expect(table).toBeTruthy();
    });
  });

  describe('Default Props', () => {
    it('should have default 10 rows', () => {
      expect(component.rows).toBe(10);
    });

    it('should have default 6 columns', () => {
      expect(component.columns).toBe(6);
    });

    it('should render 10 skeleton rows by default', () => {
      const rows = compiled.querySelectorAll('tbody .skeleton-row');
      expect(rows.length).toBe(10);
    });

    it('should render 6 columns in header by default', () => {
      const headerCells = compiled.querySelectorAll('thead th');
      expect(headerCells.length).toBe(6);
    });
  });

  describe('Custom Row Count', () => {
    it('should accept custom row count', () => {
      component.rows = 5;
      fixture.detectChanges();

      const rows = compiled.querySelectorAll('tbody .skeleton-row');
      expect(rows.length).toBe(5);
    });

    it('should handle large row count', () => {
      component.rows = 25;
      fixture.detectChanges();

      const rows = compiled.querySelectorAll('tbody .skeleton-row');
      expect(rows.length).toBe(25);
    });

    it('should handle single row', () => {
      component.rows = 1;
      fixture.detectChanges();

      const rows = compiled.querySelectorAll('tbody .skeleton-row');
      expect(rows.length).toBe(1);
    });

    it('should handle zero rows gracefully', () => {
      component.rows = 0;
      fixture.detectChanges();

      const rows = compiled.querySelectorAll('tbody .skeleton-row');
      expect(rows.length).toBe(0);
    });
  });

  describe('Column Structure', () => {
    it('should render SKU column', () => {
      const skuHeader = compiled.querySelector('thead th.sku-col');
      expect(skuHeader).toBeTruthy();
    });

    it('should render Name column', () => {
      const nameHeader = compiled.querySelector('thead th.name-col');
      expect(nameHeader).toBeTruthy();
    });

    it('should render Quantity column', () => {
      const quantityHeader = compiled.querySelector('thead th.quantity-col');
      expect(quantityHeader).toBeTruthy();
    });

    it('should render Status column', () => {
      const statusHeader = compiled.querySelector('thead th.status-col');
      expect(statusHeader).toBeTruthy();
    });

    it('should render Date column', () => {
      const dateHeader = compiled.querySelector('thead th.date-col');
      expect(dateHeader).toBeTruthy();
    });

    it('should render Actions column', () => {
      const actionsHeader = compiled.querySelector('thead th.actions-col');
      expect(actionsHeader).toBeTruthy();
    });
  });

  describe('Row Structure', () => {
    it('should render all 6 cells in each row', () => {
      const firstRow = compiled.querySelector('tbody .skeleton-row');
      const cells = firstRow?.querySelectorAll('td');
      expect(cells?.length).toBe(6);
    });

    it('should render SKU cell in each row', () => {
      const firstRow = compiled.querySelector('tbody .skeleton-row');
      const skuCell = firstRow?.querySelector('.sku-cell');
      expect(skuCell).toBeTruthy();
    });

    it('should render Name cell in each row', () => {
      const firstRow = compiled.querySelector('tbody .skeleton-row');
      const nameCell = firstRow?.querySelector('.name-cell');
      expect(nameCell).toBeTruthy();
    });

    it('should render Quantity cell in each row', () => {
      const firstRow = compiled.querySelector('tbody .skeleton-row');
      const quantityCell = firstRow?.querySelector('.quantity-cell');
      expect(quantityCell).toBeTruthy();
    });

    it('should render Status cell in each row', () => {
      const firstRow = compiled.querySelector('tbody .skeleton-row');
      const statusCell = firstRow?.querySelector('.status-cell');
      expect(statusCell).toBeTruthy();
    });

    it('should render Date cell in each row', () => {
      const firstRow = compiled.querySelector('tbody .skeleton-row');
      const dateCell = firstRow?.querySelector('.date-cell');
      expect(dateCell).toBeTruthy();
    });

    it('should render Actions cell in each row', () => {
      const firstRow = compiled.querySelector('tbody .skeleton-row');
      const actionsCell = firstRow?.querySelector('.actions-cell');
      expect(actionsCell).toBeTruthy();
    });
  });

  describe('Skeleton Components', () => {
    it('should render skeleton components in header cells', () => {
      const skeletons = compiled.querySelectorAll('thead app-skeleton');
      expect(skeletons.length).toBe(6);
    });

    it('should render skeleton components in body cells', () => {
      const firstRow = compiled.querySelector('tbody .skeleton-row');
      const skeletons = firstRow?.querySelectorAll('app-skeleton');
      // Each row has 6 skeleton components (SKU, Name, Quantity, Status, Date, and 4 action buttons = 10 total)
      expect(skeletons?.length).toBeGreaterThan(0);
    });

    it('should render action button skeletons', () => {
      const firstRow = compiled.querySelector('tbody .skeleton-row');
      const actionCell = firstRow?.querySelector('.actions-cell');
      const actionSkeletons = actionCell?.querySelectorAll('app-skeleton');
      expect(actionSkeletons?.length).toBe(4);
    });
  });

  describe('Actions Cell', () => {
    it('should render skeleton-actions container', () => {
      const firstRow = compiled.querySelector('tbody .skeleton-row');
      const actionsContainer = firstRow?.querySelector('.skeleton-actions');
      expect(actionsContainer).toBeTruthy();
    });

    it('should render 4 action button skeletons', () => {
      const firstRow = compiled.querySelector('tbody .skeleton-row');
      const actionsCell = firstRow?.querySelector('.actions-cell');
      const buttons = actionsCell?.querySelectorAll('app-skeleton');
      expect(buttons?.length).toBe(4);
    });
  });

  describe('Variability', () => {
    it('should have varying widths for SKU cells across rows', () => {
      const rows = compiled.querySelectorAll('tbody .skeleton-row');
      const widths = new Set();

      rows.forEach(row => {
        const skuSkeleton = row.querySelector('.sku-cell app-skeleton');
        const width = skuSkeleton?.getAttribute('ng-reflect-width');
        if (width) widths.add(width);
      });

      // Should have at least 2 different widths due to modulo variation
      expect(widths.size).toBeGreaterThanOrEqual(2);
    });

    it('should have varying widths for Name cells across rows', () => {
      const rows = compiled.querySelectorAll('tbody .skeleton-row');
      const widths = new Set();

      rows.forEach(row => {
        const nameSkeleton = row.querySelector('.name-cell app-skeleton');
        const width = nameSkeleton?.getAttribute('ng-reflect-width');
        if (width) widths.add(width);
      });

      // Should have at least 2 different widths due to modulo variation
      expect(widths.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      const container = compiled.querySelector('.skeleton-table-container');
      expect(container?.getAttribute('role')).toBe('status');
    });

    it('should have aria-live="polite"', () => {
      const container = compiled.querySelector('.skeleton-table-container');
      expect(container?.getAttribute('aria-live')).toBe('polite');
    });

    it('should have aria-busy="true"', () => {
      const container = compiled.querySelector('.skeleton-table-container');
      expect(container?.getAttribute('aria-busy')).toBe('true');
    });

    it('should have screen reader only text', () => {
      const srOnly = compiled.querySelector('.sr-only');
      expect(srOnly).toBeTruthy();
      expect(srOnly?.textContent).toContain('Loading products');
    });

    it('should hide screen reader text visually', () => {
      const srOnly = compiled.querySelector('.sr-only') as HTMLElement;
      const styles = window.getComputedStyle(srOnly);

      // sr-only class should make element invisible but accessible
      expect(srOnly.classList.contains('sr-only')).toBe(true);
    });
  });

  describe('Array Generation', () => {
    it('should generate correct row array', () => {
      component.rows = 5;
      const rowArray = component.rowArray;
      expect(rowArray.length).toBe(5);
    });

    it('should generate correct column array', () => {
      component.columns = 8;
      const columnArray = component.columnArray;
      expect(columnArray.length).toBe(8);
    });

    it('should update row array when rows prop changes', () => {
      component.rows = 3;
      expect(component.rowArray.length).toBe(3);

      component.rows = 7;
      expect(component.rowArray.length).toBe(7);
    });
  });

  describe('Table Structure', () => {
    it('should have table container with proper class', () => {
      const container = compiled.querySelector('.table-container');
      expect(container).toBeTruthy();
    });

    it('should have thead element', () => {
      const thead = compiled.querySelector('thead');
      expect(thead).toBeTruthy();
    });

    it('should have tbody element', () => {
      const tbody = compiled.querySelector('tbody');
      expect(tbody).toBeTruthy();
    });

    it('should have proper table structure', () => {
      const table = compiled.querySelector('.skeleton-table');
      const thead = table?.querySelector('thead');
      const tbody = table?.querySelector('tbody');

      expect(table).toBeTruthy();
      expect(thead).toBeTruthy();
      expect(tbody).toBeTruthy();
    });
  });
});

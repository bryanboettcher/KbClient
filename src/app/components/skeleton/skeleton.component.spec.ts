import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  let component: SkeletonComponent;
  let fixture: ComponentFixture<SkeletonComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render a skeleton div', () => {
      const skeleton = compiled.querySelector('.skeleton');
      expect(skeleton).toBeTruthy();
    });

    it('should have aria-hidden attribute', () => {
      const skeleton = compiled.querySelector('.skeleton');
      expect(skeleton?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Default Props', () => {
    it('should have default width of 100%', () => {
      expect(component.width).toBe('100%');
    });

    it('should have default height of 1rem', () => {
      expect(component.height).toBe('1rem');
    });

    it('should have default borderRadius of 0.25rem', () => {
      expect(component.borderRadius).toBe('0.25rem');
    });

    it('should have default variant of rectangular', () => {
      expect(component.variant).toBe('rectangular');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom width', () => {
      component.width = '200px';
      fixture.detectChanges();
      expect(component.computedStyles['width']).toBe('200px');
    });

    it('should accept custom height', () => {
      component.height = '2rem';
      fixture.detectChanges();
      expect(component.computedStyles['height']).toBe('2rem');
    });

    it('should accept custom borderRadius', () => {
      component.borderRadius = '0.5rem';
      fixture.detectChanges();
      expect(component.computedStyles['border-radius']).toBe('0.5rem');
    });

    it('should apply custom styles to DOM element', () => {
      component.width = '150px';
      component.height = '3rem';
      fixture.detectChanges();

      const skeleton = compiled.querySelector('.skeleton') as HTMLElement;
      expect(skeleton.style.width).toBe('150px');
      expect(skeleton.style.height).toBe('3rem');
    });
  });

  describe('Variant - Rectangular', () => {
    it('should use custom border-radius for rectangular variant', () => {
      component.variant = 'rectangular';
      component.borderRadius = '0.5rem';
      fixture.detectChanges();

      expect(component.computedStyles['border-radius']).toBe('0.5rem');
    });
  });

  describe('Variant - Circular', () => {
    it('should override border-radius to 50% for circular variant', () => {
      component.variant = 'circular';
      component.borderRadius = '0.25rem';
      fixture.detectChanges();

      expect(component.computedStyles['border-radius']).toBe('50%');
    });

    it('should apply circular border-radius to DOM element', () => {
      component.variant = 'circular';
      fixture.detectChanges();

      const skeleton = compiled.querySelector('.skeleton') as HTMLElement;
      expect(skeleton.style.borderRadius).toBe('50%');
    });
  });

  describe('Variant - Text', () => {
    it('should use custom border-radius for text variant', () => {
      component.variant = 'text';
      component.borderRadius = '0.125rem';
      fixture.detectChanges();

      expect(component.computedStyles['border-radius']).toBe('0.125rem');
    });
  });

  describe('Computed Styles', () => {
    it('should return all required style properties', () => {
      const styles = component.computedStyles;

      expect(styles).toHaveProperty('width');
      expect(styles).toHaveProperty('height');
      expect(styles).toHaveProperty('border-radius');
    });

    it('should return current values for all properties', () => {
      component.width = '250px';
      component.height = '4rem';
      component.borderRadius = '1rem';

      const styles = component.computedStyles;

      expect(styles['width']).toBe('250px');
      expect(styles['height']).toBe('4rem');
      expect(styles['border-radius']).toBe('1rem');
    });
  });

  describe('Accessibility', () => {
    it('should be hidden from screen readers', () => {
      const skeleton = compiled.querySelector('.skeleton');
      expect(skeleton?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not have any interactive content', () => {
      const buttons = compiled.querySelectorAll('button');
      const links = compiled.querySelectorAll('a');
      const inputs = compiled.querySelectorAll('input');

      expect(buttons.length).toBe(0);
      expect(links.length).toBe(0);
      expect(inputs.length).toBe(0);
    });
  });
});

import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
    title: 'KbStore Admin - Home'
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/product-list/product-list.component').then(
        m => m.ProductListComponent
      ),
    title: 'KbStore Admin - Products'
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./features/products/product-form/product-form.component').then(
        m => m.ProductFormComponent
      ),
    title: 'KbStore Admin - New Product'
  },
  {
    path: 'products/:id/edit',
    loadComponent: () =>
      import('./features/products/product-form/product-form.component').then(
        m => m.ProductFormComponent
      ),
    title: 'KbStore Admin - Edit Product'
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/inventory/inventory.component').then(m => m.InventoryComponent),
    title: 'KbStore Admin - Inventory'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

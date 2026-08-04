import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./adminLayout').then((m) => m.adminLayoutComponent),
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },

      // TODO: build a real dashboard page - routerLink points here already,
      // so the nav item will 404 until this route exists.
      // { path: 'dashboard', loadComponent: () => import('../../pages/admin/dashboard/adminDashboardPage').then(m => m.adminDashboardPageComponent) },

      {
        path: 'products',
        loadComponent: () =>
          import('../../pages/admin/products/adminProductsPage').then(
            (m) => m.adminProductsPageComponent
          )
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('../../pages/admin/categories/adminCategoriesPage').then(
            (m) => m.adminCategoriesPageComponent
          )
      },
      {
        path: 'tags',
        loadComponent: () =>
          import('../../pages/admin/tags/adminTagsPage').then(
            (m) => m.adminTagsPageComponent
          )
      }
    ]
  }
];

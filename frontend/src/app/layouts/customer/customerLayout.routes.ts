import { Routes } from '@angular/router';

export const customerRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./customerLayout').then(m => m.customerLayoutComponent),
    children: [
      { path: 'account/profile', loadComponent: () => import('../../pages/customer/account/profile/profilePage').then(m => m.profileComponent) },
      { path: 'account/wishlist', loadComponent: () => import('../../pages/customer/account/wishlist/wishlistPage').then(m => m.wishlistComponent) },
      { path: 'home', loadComponent: () => import('../../pages/customer/home/home.component').then(m => m.HomeComponent) },
      { path: 'shop', loadComponent: () => import('../../pages/customer/shop/shop.component').then(m => m.ShopComponent) },
    ]
  }
];

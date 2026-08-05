import { Routes } from '@angular/router';

import { loginComponent } from './pages/auth/login/loginPage';
import { registerComponent } from './pages/auth/register/registerPage';
import { forgotPasswordComponent } from './pages/auth/forgotPassword/forgotPasswordPage';
import { verifyOtpComponent } from './pages/auth/verifyOtp/verifyOtpPage';

import { adminLayoutComponent } from './layouts/admin/adminLayout';
import { adminProductsPageComponent } from './pages/admin/products/adminProductsPage';
import { adminCategoriesPageComponent } from './pages/admin/categories/adminCategoriesPage';
import { adminTagsPageComponent } from './pages/admin/tags/adminTagsPage';
import { adminNotFoundComponent } from './pages/admin/notFound/adminNotFoundPage';

import { customerLayoutComponent } from './layouts/customer/customerLayout';
import { HomeComponent } from './pages/customer/home/home.component';
import { ShopComponent } from './pages/customer/shop/shop.component';
import { CartComponent } from './pages/customer/cart/cart.component';
import { accountLayoutComponent } from './layouts/customer/account/accountLayout';
import { profileComponent } from './pages/customer/account/profile/profilePage';
import { wishlistComponent } from './pages/customer/account/wishlist/wishlistPage';
import { notFoundComponent } from './pages/customer/notFound/notFoundPage';

export const routes: Routes = [
  // 1. Auth routes (no layout)
  { path: 'auth/login', component: loginComponent },
  { path: 'auth/register', component: registerComponent },
  { path: 'auth/forgot-password', component: forgotPasswordComponent },
  { path: 'auth/verify-otp', component: verifyOtpComponent },

  // 2. Admin routes MUST come BEFORE the empty path '' customer layout
  {
    path: 'admin',
    component: adminLayoutComponent,
    children: [
      { path: 'products', component: adminProductsPageComponent },
      { path: 'categories', component: adminCategoriesPageComponent },
      { path: 'tags', component: adminTagsPageComponent },
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: '404', component: adminNotFoundComponent },
      { path: '**', component: adminNotFoundComponent } // Direct match avoids route calculation issues
    ]
  },

  // 3. Customer routes (catches remaining valid routes and unknown URLs)
  {
    path: '',
    component: customerLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'shop', component: ShopComponent },
      { path: 'cart', component: CartComponent },
      {
        path: 'account',
        component: accountLayoutComponent,
        children: [
          { path: 'profile', component: profileComponent },
          { path: 'wishlist', component: wishlistComponent },
          { path: '', redirectTo: 'profile', pathMatch: 'full' }
        ]
      },
      { path: '404', component: notFoundComponent },
      { path: '**', component: notFoundComponent }
    ]
  }
];

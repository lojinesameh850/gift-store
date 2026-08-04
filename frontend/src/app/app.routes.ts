import { Routes } from '@angular/router';

import { adminLayoutComponent } from './layouts/admin/adminLayout';
import { adminProductsPageComponent } from './pages/admin/products/adminProductsPage';
import { adminCategoriesPageComponent } from './pages/admin/categories/adminCategoriesPage';
import { adminTagsPageComponent } from './pages/admin/tags/adminTagsPage';

import { customerLayoutComponent } from './layouts/customer/customerLayout';
import { accountLayoutComponent } from './layouts/customer/account/accountLayout';
import { profileComponent } from './pages/customer/account/profile/profilePage';
import { wishlistComponent } from './pages/customer/account/wishlist/wishlistPage';
import { CartComponent } from './pages/customer/cart/cart.component';
import { HomeComponent } from './pages/customer/home/home.component';
import { ShopComponent } from './pages/customer/shop/shop.component';

import { loginComponent} from './pages/auth/login/loginPage';
import { registerComponent} from './pages/auth/register/registerPage';
import { forgotPasswordComponent } from './pages/auth/forgotPassword/forgotPasswordPage';
import { verifyOtpComponent } from './pages/auth/verifyOtp/verifyOtpPage';

export const routes: Routes = [
  // Auth pages sit outside customerLayout - no top nav/footer during
  // login/register/etc. Move them inside the customerLayout children
  // below instead if you actually want that chrome on auth pages.
  { path: 'auth/login', component: loginComponent },
  { path: 'auth/register', component: registerComponent },
  { path: 'auth/forgot-password', component: forgotPasswordComponent },
  { path: 'auth/verify-otp', component: verifyOtpComponent },

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
      }
    ]
  },

  {
    path: 'admin',
    component: adminLayoutComponent,
    children: [
      { path: 'products', component: adminProductsPageComponent },
      { path: 'categories', component: adminCategoriesPageComponent },
      { path: 'tags', component: adminTagsPageComponent },
      { path: '', redirectTo: 'products', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];

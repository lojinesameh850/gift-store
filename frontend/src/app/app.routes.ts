import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';

import { accountLayoutComponent } from './pages/account/accountLayout';
import { profileComponent } from './pages/account/profile/profilePage';
import { wishlistComponent } from './pages/account/wishlist/wishlistPage';

import { loginComponent} from './pages/auth/login/loginPage';
import { registerComponent} from './pages/auth/register/registerPage';
import { forgotPasswordComponent } from './pages/auth/forgotPassword/forgotPasswordPage';
import { verifyOtpComponent } from './pages/auth/verifyOtp/verifyOtpPage';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },

  { path: 'auth/login', component: loginComponent },
  { path: 'auth/register', component: registerComponent },
  { path: 'auth/forgot-password', component: forgotPasswordComponent },
  { path: 'auth/verify-otp', component: verifyOtpComponent },

  {
    path: 'account',
    component: accountLayoutComponent,
    children: [
      { path: 'profile', component: profileComponent },
      { path: 'wishlist', component: wishlistComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  },

  { path: 'cart', component: CartComponent },

  { path: '**', redirectTo: 'error' }
];

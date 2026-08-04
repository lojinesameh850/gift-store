import { Routes } from '@angular/router';
import { accountLayoutComponent } from './pages/account/accountLayout';
import { profileComponent } from './pages/account/profilePage';
import { wishlistComponent } from './pages/account/wishlistPage';
import { CartComponent } from './pages/cart/cart.component';
export const routes: Routes = [
import { ShopComponent } from './pages/shop/shop.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'cart', component: CartComponent },

  { path: '**', redirectTo: '' },
  // Account section: shared sidebar layout with profile & wishlist as children
  { path: '', redirectTo: 'shop', pathMatch: 'full' },
  { path: 'shop', component: ShopComponent },
  {
    path: 'account',
    component: accountLayoutComponent,
    children: [
      { path: 'profile', component: profileComponent },
      { path: 'wishlist', component: wishlistComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  },
  { path: '**', component: ShopComponent }
];
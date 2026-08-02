import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';
import { profileComponent } from './pages/account/profilePage';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'account/profile', component: profileComponent },
  { path: '**', redirectTo: '' }
];

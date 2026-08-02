import { Routes } from '@angular/router';
import { accountLayoutComponent } from './pages/account/accountLayout';
import { profileComponent } from './pages/account/profilePage';
import { wishlistComponent } from './pages/account/wishlistPage';

export const routes: Routes = [
  // Redirect root URL directly to account page FOR NOW
  { path: '', redirectTo: 'account/profile', pathMatch: 'full' },

  // Account section: shared sidebar layout with profile & wishlist as children
  {
    path: 'account',
    component: accountLayoutComponent,
    children: [
      { path: 'profile', component: profileComponent },
      { path: 'wishlist', component: wishlistComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  },

  // Fallback for unknown routes
  { path: '**', redirectTo: 'error' }
];

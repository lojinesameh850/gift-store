import { Routes } from '@angular/router';
import { profileComponent } from './pages/account/profilePage';

export const routes: Routes = [
  // Redirect root URL directly to account page FOR NOW
  { path: '', redirectTo: 'account/profile', pathMatch: 'full' },

  // Customer profile route
  { path: 'account/profile', component: profileComponent },

  // Fallback for unknown routes
  { path: '**', redirectTo: 'error' }
];

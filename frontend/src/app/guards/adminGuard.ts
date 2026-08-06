import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { authService } from '../services/authService';

// Requires a logged-in admin. Not logged in -> login page. Logged in but not
// an admin -> back to the storefront home instead of the login page (they
// don't need to log in again, they just don't have access).
export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(authService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
  }

  if (auth.getRole() !== 'admin') {
    return router.createUrlTree(['/']);
  }

  return true;
};
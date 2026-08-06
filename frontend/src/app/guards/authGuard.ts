import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { authService } from '../services/authService';

// Any route wearing this guard requires a logged-in user. Anonymous visitors
// get sent to /auth/login, with the page they wanted stashed as returnUrl so
// loginPage can send them back after a successful login.
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(authService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
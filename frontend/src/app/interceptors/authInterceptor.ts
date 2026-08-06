import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { authService } from '../services/authService';

// Attaches the stored JWT (if any) to every outgoing request, and if the
// backend ever responds 401 (expired/invalid/logged-out token), clears the
// local session and bounces the user back to the login page.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(authService);
  const router = inject(Router);

  const token = auth.getToken();
  const authorizedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authorizedReq).pipe(
    catchError((err) => {
      // Only treat this as "your session expired" if we actually sent a
      // token with the request. A 401 on a request with NO token (e.g. a
      // wrong-password attempt on the login page itself) is just a normal
      // "invalid credentials" response - redirecting here would wipe out
      // the error message before the component gets to show it.
      if (err?.status === 401 && token) {
        auth.clearSessionLocally();
        router.navigateByUrl('/auth/login');
      }
      return throwError(() => err);
    })
  );
};
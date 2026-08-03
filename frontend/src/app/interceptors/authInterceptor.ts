import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { authService } from '../services/authService';

// Attaches "Authorization: Bearer <token>" to every outgoing request when a
// token is stored, and clears the session + redirects to /login if the
// backend ever responds 401 (expired token, or logged out on another device -
// see authmiddleware.js's activeToken check).
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(authService);
  const router = inject(Router);
  const token = auth.getToken();

  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.clearSessionLocally();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

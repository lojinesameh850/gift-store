import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { notificationService } from '../services/notificationService';

// Catches any failed request, anywhere in the app, and surfaces the
// backend's message as a toast - so components don't each need their own
// console.error/alert() pair. 401s are deliberately skipped here: authInterceptor
// already owns that case (clear session + redirect), and showing a toast on
// top of a redirect is just noise.
export const notificationInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(notificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        const message = error.error?.message || 'Something went wrong. Please try again.';
        notifications.showError(message);
      }
      return throwError(() => error);
    })
  );
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { loadingService } from '../services/loadingService';

// Wraps every outgoing request with increment()/decrement() on loadingService,
// regardless of which component or service fired it. finalize() runs on
// success, error, AND cancellation, so the counter can never get stuck.
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(loadingService);
  loading.increment();

  return next(req).pipe(finalize(() => loading.decrement()));
};
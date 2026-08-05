import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Pass all requests directly through without attached headers or 401 redirects
  return next(req);
};

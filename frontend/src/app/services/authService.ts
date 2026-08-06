import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, timeout, catchError, throwError, TimeoutError } from 'rxjs';

export interface authUser {
  _id: string;
  email: string;
  role: 'customer' | 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface authResponseData {
  token: string;
  role: 'customer' | 'admin';
  user: authUser;
}

export interface authResponse {
  success: boolean;
  message: string;
  data: authResponseData;
}

export interface registerPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface loginPayload {
  email: string;
  password: string;
}

const TOKEN_KEY = 'authToken';
const ROLE_KEY = 'authRole';
const USER_KEY = 'authUser';

const AUTH_API_BASE = '/api/auth';
const REQUEST_TIMEOUT_MS = 15000;

// Applied to every auth HTTP call: if the backend/proxy never responds within
// 15s, this turns the hang into a visible error instead of a spinner that
// spins forever - and shapes it like a normal HttpErrorResponse (err.error.message)
// so every component's existing `err.error?.message || '...'` fallback still works.
function withRequestTimeout<T>(source: Observable<T>): Observable<T> {
  return source.pipe(
    timeout(REQUEST_TIMEOUT_MS),
    catchError((err) => {
      if (err instanceof TimeoutError) {
        return throwError(() => ({
          status: 0,
          error: { success: false, message: 'The server is taking too long to respond. Please check your connection and try again.' }
        }));
      }
      return throwError(() => err);
    })
  );
}

@Injectable({ providedIn: 'root' })
export class authService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  register(payload: registerPayload): Observable<authResponse> {
    return this.http
      .post<authResponse>(`${AUTH_API_BASE}/register`, payload)
      .pipe(withRequestTimeout, tap((res) => this.storeSession(res.data)));
  }

  login(payload: loginPayload): Observable<authResponse> {
    return this.http
      .post<authResponse>(`${AUTH_API_BASE}/login`, payload)
      .pipe(withRequestTimeout, tap((res) => this.storeSession(res.data)));
  }

  logout(): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(`${AUTH_API_BASE}/logout`, {})
      .pipe(withRequestTimeout, tap(() => this.clearSession()));
  }

  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(`${AUTH_API_BASE}/forgot-password`, { email })
      .pipe(withRequestTimeout);
  }

  verifyOtp(email: string, otp: string): Observable<{ success: boolean; message: string; data: { resetToken: string } }> {
    return this.http
      .post<{ success: boolean; message: string; data: { resetToken: string } }>(`${AUTH_API_BASE}/verify-otp`, { email, otp })
      .pipe(withRequestTimeout);
  }

  resetPassword(resetToken: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(`${AUTH_API_BASE}/reset-password`, { resetToken, newPassword })
      .pipe(withRequestTimeout);
  }

  private storeSession(data: authResponseData): void {
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(ROLE_KEY, data.role);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
  }

  private clearSession(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  clearSessionLocally(): void {
    this.clearSession();
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  getRole(): 'customer' | 'admin' | null {
    if (this.isBrowser) {
      return localStorage.getItem(ROLE_KEY) as 'customer' | 'admin' | null;
    }
    return null;
  }

  getStoredUser(): authUser | null {
    if (this.isBrowser) {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
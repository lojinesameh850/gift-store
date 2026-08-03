import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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

// NOTE: mirrors the base-URL pattern used by customerService for the rest of
// the app - adjust the leading path here if customerService points somewhere
// other than "/api".
const AUTH_API_BASE = '/api/auth';

@Injectable({ providedIn: 'root' })
export class authService {
  constructor(private http: HttpClient) {}

  register(payload: registerPayload): Observable<authResponse> {
    return this.http
      .post<authResponse>(`${AUTH_API_BASE}/register`, payload)
      .pipe(tap((res) => this.storeSession(res.data)));
  }

  login(payload: loginPayload): Observable<authResponse> {
    return this.http
      .post<authResponse>(`${AUTH_API_BASE}/login`, payload)
      .pipe(tap((res) => this.storeSession(res.data)));
  }

  logout(): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(`${AUTH_API_BASE}/logout`, {})
      .pipe(tap(() => this.clearSession()));
  }

  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${AUTH_API_BASE}/forgot-password`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<{ success: boolean; message: string; data: { resetToken: string } }> {
    return this.http.post<{ success: boolean; message: string; data: { resetToken: string } }>(
      `${AUTH_API_BASE}/verify-otp`,
      { email, otp }
    );
  }

  resetPassword(resetToken: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${AUTH_API_BASE}/reset-password`, {
      resetToken,
      newPassword
    });
  }

  private storeSession(data: authResponseData): void {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(ROLE_KEY, data.role);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Called directly by an error handler (e.g. the auth interceptor) when the
  // backend reports the token is no longer valid, without waiting on /logout.
  clearSessionLocally(): void {
    this.clearSession();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRole(): 'customer' | 'admin' | null {
    return (localStorage.getItem(ROLE_KEY) as 'customer' | 'admin' | null);
  }

  getStoredUser(): authUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

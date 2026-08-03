import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';

export interface category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

interface categoryListResponse {
  success: boolean;
  count: number;
  data: category[];
}

interface categoryResponse {
  success: boolean;
  message: string;
  data: category;
}

interface productListResponse {
  success: boolean;
  count: number;
  total: number;
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class adminCategoryService {
  // NOTE: no auth interceptor was present in the shared frontend code, so the
  // admin token is attached explicitly here. Swap this for an HttpInterceptor
  // once one exists - same token, just applied globally instead of per-call.
  private apiUrl = 'http://localhost:5000/api/admin/categories';
  private productsUrl = 'http://localhost:5000/api/admin/products';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<categoryListResponse> {
    return this.http.get<categoryListResponse>(this.apiUrl, { headers: this.authHeaders() });
  }

  create(payload: Partial<category>): Observable<categoryResponse> {
    return this.http.post<categoryResponse>(this.apiUrl, payload, { headers: this.authHeaders() });
  }

  update(id: string, payload: Partial<category>): Observable<categoryResponse> {
    return this.http.put<categoryResponse>(`${this.apiUrl}/${id}`, payload, { headers: this.authHeaders() });
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, { headers: this.authHeaders() });
  }

  // Categories don't carry a product count field, so we ask the admin products
  // endpoint for the total matching a given category (limit=1 keeps the payload tiny).
  getProductCount(categoryId: string): Observable<productListResponse> {
    return this.http.get<productListResponse>(`${this.productsUrl}?category=${categoryId}&limit=1`, {
      headers: this.authHeaders()
    });
  }
}

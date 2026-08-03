import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';

export interface productCategoryRef {
  _id: string;
  name: string;
}

export interface productTagRef {
  _id: string;
  name: string;
}

export interface product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: productCategoryRef | string;
  tags: productTagRef[];
  images: string[];
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface productListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  message?: string;
  data: product[];
}

export interface productQuery {
  search?: string;
  category?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

// Payload shape for create/update - category/tags are ids, not populated refs.
export interface productPayload {
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  images: string[];
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
}

const API_URL = 'http://localhost:5000'; // Define it right here

@Injectable({ providedIn: 'root' })
export class adminProductService {
  // Adjust to match wherever adminProductRoutes is mounted in your Express app
  // (e.g. app.use('/api/admin/products', adminProductRoutes)).
  private readonly baseUrl = `${API_URL}/admin/products`;

  constructor(private http: HttpClient) {}

  getAll(query: productQuery = {}): Observable<productListResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<productListResponse>(this.baseUrl, { params });
  }

  getById(id: string): Observable<{ success: boolean; data: product }> {
    return this.http.get<{ success: boolean; data: product }>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<productPayload>): Observable<{ success: boolean; message: string; data: product }> {
    return this.http.post<{ success: boolean; message: string; data: product }>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<productPayload>): Observable<{ success: boolean; message: string; data: product }> {
    return this.http.put<{ success: boolean; message: string; data: product }>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';

export interface tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface tagListResponse {
  success: boolean;
  count: number;
  data: tag[];
}

export interface tagQuery {
  search?: string;
  isActive?: boolean;
}

export interface tagPayload {
  name: string;
  description?: string;
  isActive: boolean;
}

const API_URL = 'http://localhost:5000'; // Define it right here

@Injectable({ providedIn: 'root' })
export class adminTagService {
  private readonly baseUrl = `${API_URL}/admin/tags`;
  // adminProductRoutes doubles as the count source since there's no
  // dedicated /admin/tags/:id/count endpoint - same approach the
  // categories page uses via adminCategoryService.getProductCount.
  private readonly productsUrl = `${API_URL}/admin/products`;

  constructor(private http: HttpClient) {}

  getProductCount(tagId: string): Observable<{ total: number }> {
    const params = new HttpParams().set('tag', tagId).set('limit', '1');
    return this.http.get<{ total: number }>(this.productsUrl, { params });
  }

  getAll(query: tagQuery = {}): Observable<tagListResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<tagListResponse>(this.baseUrl, { params });
  }

  getById(id: string): Observable<{ success: boolean; data: tag }> {
    return this.http.get<{ success: boolean; data: tag }>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<tagPayload>): Observable<{ success: boolean; message: string; data: tag }> {
    return this.http.post<{ success: boolean; message: string; data: tag }>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<tagPayload>): Observable<{ success: boolean; message: string; data: tag }> {
    return this.http.put<{ success: boolean; message: string; data: tag }>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}

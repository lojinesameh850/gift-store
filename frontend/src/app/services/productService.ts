import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../components/product-card/product-card.component';

interface BackendProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

interface ProductsResponse {
  success: boolean;
  data: BackendProduct[];
}

export interface GetProductsParams {
  limit?: number;
  sort?: 'lowest-price' | 'highest-price' | 'newest' | 'oldest';
}

@Injectable({ providedIn: 'root' })
export class productService {
  private apiUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(params: GetProductsParams = {}): Observable<Product[]> {
    return this.http
      .get<ProductsResponse>(this.apiUrl, { params: params as Record<string, string | number> })
      .pipe(map(res => (res.data ?? []).map(p => ({ id: p._id, name: p.name, price: p.price, image: p.images?.[0] }))));
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../components/product-card/product-card.component';

export interface GetProductsParams {
  limit?: number;
  sort?: 'lowest-price' | 'highest-price' | 'newest' | 'oldest';
  category?: string;
  tags?: string;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable({ providedIn: 'root' })
export class productService {
  private apiUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(params: GetProductsParams = {}): Observable<Product[]> {
    return this.http
      .get<any>(this.apiUrl, {
        params: params as Record<string, string | number>,
      })
      .pipe(
        map((res) => {
          let rawProducts: any[] = [];

          if (Array.isArray(res)) {
            rawProducts = res;
          } else if (Array.isArray(res?.data)) {
            rawProducts = res.data;
          } else if (Array.isArray(res?.data?.products)) {
            rawProducts = res.data.products;
          } else if (Array.isArray(res?.products)) {
            rawProducts = res.products;
          }

          return rawProducts.map((p) => ({
            id: p._id || p.id,
            name: p.name,
            price: p.price,
            image: p.images?.[0] || p.image || '',
            category: p.category,
            tags: p.tags,
          }));
        }),
      );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  discount: number;
  images: string[];
  category?: { _id: string; name: string };
}

export interface CartItem {
  _id: string;
  product: CartProduct;
  quantity: number;
}

interface CartResponse {
  success: boolean;
  data: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:5000/api/cart';

  /** In-memory cart state. null = not yet loaded. */
  private _cart$ = new BehaviorSubject<CartItem[] | null>(null);

  /** Observable the component subscribes to. */
  readonly cart$ = this._cart$.asObservable();

  // TODO: Replace with real auth token headers once authentication is implemented
  private get mockHeaders(): HttpHeaders {
    return new HttpHeaders({ 'x-mock-user-id': '6a6ce40743e3c665222d3726' });
  }

  constructor(private http: HttpClient) { }

  /**
   * Returns true if the cart has already been loaded at least once.
   * Used by the component to skip redundant API calls on re-visits.
   */
  get isLoaded(): boolean {
    return this._cart$.value !== null;
  }

  private get current(): CartItem[] {
    return this._cart$.value ?? [];
  }

  /**
   * Fetches the cart from the backend and updates the cached state.
   * Call this on first visit or after an addToCart operation.
   */
  fetchCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.apiUrl, { headers: this.mockHeaders }).pipe(
      tap(res => this._cart$.next(res.data ?? []))
    );
  }

  addToCart(productId: string, quantity: number = 1): Observable<any> {
    return this.http.post(this.apiUrl, { productId, quantity }, { headers: this.mockHeaders }).pipe(
      // Re-fetch after adding so the cache reflects the server state
      tap(() => this.fetchCart().subscribe())
    );
  }

  /**
   * Removes an item and patches local state immediately — no re-fetch needed.
   * The cache is updated synchronously so the UI reacts without waiting for the
   * HTTP response; the server call runs after and rolls the cache back on error.
   */
  removeFromCart(productId: string): Observable<any> {
    const previous = this._cart$.value;
    this._cart$.next(this.current.filter(i => i.product._id !== productId));
    return this.http.delete(`${this.apiUrl}/${productId}`, { headers: this.mockHeaders }).pipe(
      catchError(err => {
        if (previous !== null) this._cart$.next(previous);
        return throwError(() => err);
      })
    );
  }

  /**
   * Updates quantity and patches local state immediately — no re-fetch needed.
   * The cache is updated synchronously so the UI reacts without waiting for the
   * HTTP response; the server call runs after and rolls the cache back on error.
   */
  updateQuantity(productId: string, quantity: number): Observable<any> {
    const previous = this._cart$.value;
    this._cart$.next(
      this.current.map(i => i.product._id === productId ? { ...i, quantity } : i)
    );
    return this.http.put(`${this.apiUrl}/${productId}`, { quantity }, { headers: this.mockHeaders }).pipe(
      catchError(err => {
        if (previous !== null) this._cart$.next(previous);
        return throwError(() => err);
      })
    );
  }
}

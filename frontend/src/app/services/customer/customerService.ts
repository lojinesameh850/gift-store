import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// For profile info
export interface shippingAddress {
  _id?: string;
  street: string;
  city: string;
  building: string;
  apartment?: string;
  isDefault: boolean;
}

export interface customerProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  shippingAddresses?: shippingAddress[];
}

// For wishlist
export interface wishlistItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discount: number;
  images: string[];
  stock: number;
  isActive: boolean;
}

interface wishlistResponse {
  success: boolean;
  count: number;
  data: wishlistItem[];
}

@Injectable({
  providedIn: 'root'
})
export class customerService {
  private apiUrl = 'http://localhost:5000/api/account';

  constructor(private http: HttpClient) {}

  //  For profile info
  getProfile(): Observable<customerProfile> {
    return this.http.get<customerProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(profileData: Partial<customerProfile>): Observable<customerProfile> {
    return this.http.put<customerProfile>(`${this.apiUrl}/profile`, profileData);
  }

  // For wishlist
  getWishlist(): Observable<wishlistResponse> {
    return this.http.get<wishlistResponse>(`${this.apiUrl}/wishlist`);
  }

  addToWishlist(productId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/wishlist/${productId}`, {});
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/wishlist/${productId}`);
   }

}

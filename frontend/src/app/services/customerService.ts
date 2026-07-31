import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class customerService {
  private apiUrl = 'http://localhost:5000/api/account';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<customerProfile> {
    return this.http.get<customerProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(profileData: Partial<customerProfile>): Observable<customerProfile> {
    return this.http.put<customerProfile>(`${this.apiUrl}/profile`, profileData);
  }
}

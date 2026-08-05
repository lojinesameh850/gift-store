import { Component, OnInit, inject } from '@angular/core';
<<<<<<< HEAD:frontend/src/app/pages/shop/shop.component.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
=======
import { HttpClient } from '@angular/common/http';
import { NgFor } from '@angular/common';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
>>>>>>> 04b7d90cda87f1353f60c7dad45a0c90b5e1ba3d:frontend/src/app/pages/customer/shop/shop.component.ts

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [NgFor, NgIf, ProductCardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {

  categories: any[] = [];
  tags: any[] = [];
  products: any[] = [];

  selectedTags: string[] = [];

  private http = inject(HttpClient);

  ngOnInit() {
    this.fetchTags();
    this.fetchProducts();
  }

  fetchTags() {
    const apiUrl = 'http://localhost:5000/api/tags';
    this.http.get<any>(apiUrl).subscribe({
      next: (res) => {
        this.tags = res?.data ?? res ?? [];
        console.log('Tags loaded:', this.tags);
      },
      error: (err) => console.error('Error fetching tags:', err)
    });
  }

  fetchProducts() {
    let params = new HttpParams();

    if (this.selectedTags.length > 0) {
      params = params.set('tags', this.selectedTags.join(','));
    }

    const apiUrl = 'http://localhost:5000/api/products';
    this.http.get<any>(apiUrl, { params }).subscribe({
      next: (res) => {
        this.products = res?.data ?? res ?? [];
        console.log('Products loaded:', this.products);
      },
      error: (err) => console.error('Error fetching products:', err)
    });
  }
<<<<<<< HEAD:frontend/src/app/pages/shop/shop.component.ts
=======

>>>>>>> 04b7d90cda87f1353f60c7dad45a0c90b5e1ba3d:frontend/src/app/pages/customer/shop/shop.component.ts

  onTagSelect(event: Event, tag: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const tagId = tag._id || tag.id;

    if (isChecked) {
      this.selectedTags.push(tagId);
    } else {
      this.selectedTags = this.selectedTags.filter(id => id !== tagId);
    }

    console.log('Selected Tags:', this.selectedTags);
    this.fetchProducts();
  }

}

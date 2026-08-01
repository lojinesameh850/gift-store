import { Component, input } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})

export class ProductCardComponent {
  product = input.required<Product>();
  onAddToCart() {
    console.log('Product added:', this.product());
  }
}

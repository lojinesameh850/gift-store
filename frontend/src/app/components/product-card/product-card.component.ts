import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [NgIf],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() product!: Product;

  onAddToCart() {
    console.log('Product added:', this.product);
  }
}

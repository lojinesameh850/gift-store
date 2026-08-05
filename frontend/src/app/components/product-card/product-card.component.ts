import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { CartService } from '../../services/customer/cartService';

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

  isLoading = false;

  constructor(private cartService: CartService) { }

  onAddToCart(): void {
    if (!this.product?.id || this.isLoading) return;

    this.isLoading = true;
    this.cartService.addToCart(this.product.id, 1).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to add product to cart:', err);
        this.isLoading = false;
      }
    });
  }
}

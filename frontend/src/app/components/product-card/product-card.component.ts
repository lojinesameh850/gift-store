import { Component, Input } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { CartService } from '../../services/customer/cartService';
import { customerService } from '../../services/customer/customerService';

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() isInWishlist = false;

  isLoading = false;
  isWishlistLoading = false;

  constructor(private cartService: CartService, private customerService: customerService) { }

  onAddToCart(): void {
    const productId = this.product?.id || (this.product as any)?._id;

    if (!productId || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.cartService.addToCart(productId, 1).subscribe({
      next: (res) => {
        console.log(res);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to add product to cart:', err);
        this.isLoading = false;
      }
    });
  }

  onToggleWishlist(): void {
    const productId = this.product?.id || (this.product as any)?._id;


    if (!productId || this.isWishlistLoading) return;

    this.isWishlistLoading = true;
    const wasInWishlist = this.isInWishlist;
    const request$ = wasInWishlist
      ? this.customerService.removeFromWishlist(productId)
      : this.customerService.addToWishlist(productId);

    request$.subscribe({
      next: (res) => {
        this.isInWishlist = !wasInWishlist;
        this.isWishlistLoading = false;
      },
      error: (err) => {
        console.error('Failed to update wishlist:', err);
        this.isWishlistLoading = false;
      }
    });
  }
}

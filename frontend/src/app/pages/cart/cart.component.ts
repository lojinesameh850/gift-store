import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cartService';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  items: CartItem[] = [];
  isLoading = true;

  promoCode = '';

  // TODO: Replace with dynamic values from backend when fee endpoints are available
  readonly giftWrapping = 50;
  readonly deliveryFee = 60;

  private cartSub?: Subscription;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartSub = this.cartService.cart$.subscribe(cart => {
      this.items = cart ?? [];
      if (cart) this.isLoading = false;
    });

    if (!this.cartService.isLoaded) {
      // First visit — fetch from backend
      this.cartService.fetchCart().subscribe({
        error: (err) => {
          console.error('Failed to load cart:', err);
          this.isLoading = false;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => {
      return +(sum + this.effectivePrice(item) * item.quantity).toFixed();
    }, 0);
  }

  get total(): number {
    return this.subtotal + this.giftWrapping + this.deliveryFee;
  }

  get itemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  effectivePrice(item: CartItem): number {
    const p = item.product;
    if (!p.discount) return p.price;
    return +(p.price - (p.price * p.discount) / 100).toFixed(2);
  }

  trackByItemId(_index: number, item: CartItem): string {
    return item.product._id;
  }

  increment(item: CartItem): void {
    this.setQuantity(item, item.quantity + 1);
  }

  decrement(item: CartItem): void {
    if (item.quantity <= 1) return;
    this.setQuantity(item, item.quantity - 1);
  }

  setQuantity(item: CartItem, qty: number): void {
    this.cartService.updateQuantity(item.product._id, qty).subscribe({
      error: (err) => console.error('Failed to update quantity:', err)
    });
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.product._id).subscribe({
      error: (err) => console.error('Failed to remove item:', err)
    });
  }

  // TODO: Replace with actual promo code validation once backend endpoint exists
  onApplyPromo(): void {
    console.log('Promo code submitted:', this.promoCode);
  }

  // TODO: Wire up to checkout route/flow once implemented
  onCheckout(): void {
    console.log('Proceeding to checkout with', this.itemCount, 'items, total:', this.total);
  }
}

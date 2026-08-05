import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../../services/customer/cartService';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  items = signal<CartItem[]>([]);
  isLoading = signal(true);

  promoCode = signal('');

  // TODO: Replace with dynamic values from backend when fee endpoints are available
  readonly giftWrapping = 50;
  readonly deliveryFee = 60;

  private cartSub?: Subscription;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartSub = this.cartService.cart$.subscribe(cart => {
      this.items.set(cart ?? []);
      if (cart) this.isLoading.set(false);
    });

    if (!this.cartService.isLoaded) {
      // First visit — fetch from backend
      this.cartService.fetchCart().subscribe({
        error: (err) => {
          console.error('Failed to load cart:', err);
          this.isLoading.set(false);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  get subtotal(): number {
    return this.items().reduce((sum, item) => {
      const price = item?.product?.price ?? 0;
      return+(sum + (price * item.quantity)).toFixed(2);
    }, 0);
  }

  get total(): number {
    return this.subtotal + this.giftWrapping + this.deliveryFee;
  }

  get itemCount(): number {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  }

  trackByItemId(_index: number, item: CartItem): string {
    return item?.product?._id || item?._id || _index.toString();
  }

  increment(item: CartItem): void {
    this.setQuantity(item, item.quantity + 1);
  }

  decrement(item: CartItem): void {
    if (item.quantity <= 1) return;
    this.setQuantity(item, item.quantity - 1);
  }

  setQuantity(item: CartItem, qty: number): void {
    if (!item?.product?._id) return;
    this.cartService.updateQuantity(item.product._id, qty).subscribe({
      error: (err) => console.error('Failed to update quantity:', err)
    });
  }

  removeItem(item: CartItem): void {
    if (!item?.product?._id) return;
    this.cartService.removeFromCart(item.product._id).subscribe({
      error: (err) => console.error('Failed to remove item:', err)
    });
  }

  onApplyPromo(): void {
    console.log('Promo code submitted:', this.promoCode());
  }

  onCheckout(): void {
    console.log('Proceeding to checkout with', this.itemCount, 'items, total:', this.total);
  }
}

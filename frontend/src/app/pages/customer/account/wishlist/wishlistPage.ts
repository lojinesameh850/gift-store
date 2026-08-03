import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { customerService, wishlistItem } from '../../../../services/customer/customerService';
import { notificationService } from '../../../../services/notificationService';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlistPage.html',
  styleUrl: './wishlistPage.css'
})
export class wishlistComponent implements OnInit {
  items = signal<wishlistItem[]>([]);
  isLoading = signal(true);
  removingId = signal<string | null>(null);

  constructor(
    private customerService: customerService,
    private notifications: notificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading.set(true);
    this.customerService.getWishlist().subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        // notificationInterceptor already surfaces the error toast - just
        // stop the loading state here.
        this.isLoading.set(false);
      }
    });
  }

  onRemove(item: wishlistItem): void {
    // Guard against double-clicks while a removal is in flight
    if (this.removingId()) return;

    this.removingId.set(item._id);
    this.customerService.removeFromWishlist(item._id).subscribe({
      next: () => {
        // Update local state directly instead of reloading the whole page.
        this.items.update((list) => list.filter((i) => i._id !== item._id));
        this.removingId.set(null);
        this.notifications.showSuccess('Removed from wishlist');
      },
      error: () => {
        this.removingId.set(null);
      }
    });
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  // Assumes `discount` is stored as a percentage (0-100), matching the
  // default of 0 in productModel.js. Adjust here if it's a flat amount instead.
  discountedPrice(item: wishlistItem): number {
    if (!item.discount) return item.price;
    return +(item.price - (item.price * item.discount) / 100).toFixed(2);
  }
}

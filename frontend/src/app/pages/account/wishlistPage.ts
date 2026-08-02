import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { customerService, wishlistItem } from '../../services/customerService';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlistPage.html',
  styleUrl: './wishlistPage.css'
})
export class wishlistComponent implements OnInit {
  items: wishlistItem[] = [];
  isLoading = true;
  removingId: string | null = null;

  constructor(
    private customerService: customerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.customerService.getWishlist().subscribe({
      next: (res) => {
        this.items = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load wishlist:', err);
        this.isLoading = false;
      }
    });
  }

  onRemove(item: wishlistItem): void {
    // Guard against double-clicks while a removal is in flight
    if (this.removingId) return;

    this.removingId = item._id;
    this.customerService.removeFromWishlist(item._id).subscribe({
      next: () => {
        // Force reload so the page reflects the change immediately,
        // matching the pattern used in profilePage's address updates.
        window.location.reload();
      },
      error: (err) => {
        console.error('Failed to remove item from wishlist:', err);
        this.removingId = null;
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

import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { authService } from '../../../services/authService';

// The account sidebar (profile/wishlist nav). Nested inside customerLayout
// under the /account route only - NOT the site-wide shell. See
// layouts/customer/customerLayout.ts for the top nav + footer wrapper.
@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './accountLayout.html',
  styleUrl: './accountLayout.css'
})
export class accountLayoutComponent {
  private router = inject(Router);
  private authService = inject(authService);

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/auth/login'),
      error: () => {
        this.authService.clearSessionLocally();
        this.router.navigateByUrl('/auth/login');
      }
    });
  }
}
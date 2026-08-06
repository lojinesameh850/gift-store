import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { authService } from '../../services/authService';

// Admin shell: dark sidebar (logo + nav) on the left, routed page content on the right.
// "Orders" is intentionally omitted from the nav per instruction to ignore
// ordering/spending features. Add it back here (and to app.routes.ts) if that changes.
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './adminLayout.html',
  styleUrl: './adminLayout.css'
})
export class adminLayoutComponent {
  private router = inject(Router);
  private authService = inject(authService);

  logout(): void {
    this.authService.logout().subscribe({
      // Whether the server call succeeds or fails, the local session should
      // still be cleared and the admin sent back to the login page.
      next: () => this.router.navigateByUrl('/auth/login'),
      error: () => {
        this.authService.clearSessionLocally();
        this.router.navigateByUrl('/auth/login');
      }
    });
  }
}
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

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

  logout(): void {
    // Add your auth service logout logic here (e.g., this.authService.logout())
    localStorage.removeItem('token'); // Clear stored token/session if applicable
    this.router.navigate(['/login']); // Navigate back to login page
  }
}

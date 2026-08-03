import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

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
export class accountLayoutComponent {}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

// Wraps every customer-facing route (home, shop, account) with the
// persistent top nav + footer. This is NOT the account sidebar -
// that's accountLayoutComponent, nested under the /account route only,
// living at pages/account/accountLayout.ts (unchanged).
@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './customerLayout.html',
  styleUrl: './customerLayout.css'
})
export class customerLayoutComponent {}

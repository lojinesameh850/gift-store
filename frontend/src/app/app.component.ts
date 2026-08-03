import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

const NO_NAVBAR_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/verify-otp'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Gift Store';

  // Declared before showNavbar$ so it's already assigned by the time
  // showNavbar$'s initializer runs - field initializers execute top-to-bottom,
  // and inject() works here without needing a constructor.
  private router = inject(Router);

  showNavbar$: Observable<boolean> = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map((e) => this.isNavbarRoute(e.urlAfterRedirects)),
    startWith(this.isNavbarRoute(this.router.url))
  );

  private isNavbarRoute(url: string): boolean {
    return !NO_NAVBAR_PATHS.some((path) => url.startsWith(path));
  }
}

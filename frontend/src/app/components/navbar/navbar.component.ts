import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = signal(false);
  searchTerm = signal('');

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  onSearchSubmit(): void {
    const term = this.searchTerm().trim();
    if (!term) return;
    // TODO: wire up once Shop route supports a ?search query param
    console.log('Search submitted:', term);
  }
}
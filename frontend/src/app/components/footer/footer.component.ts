import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  newsletterEmail = signal('');

  onNewsletterSubmit(): void {
    const email = this.newsletterEmail().trim();
    if (!email) return;
    // TODO: wire up once a newsletter/subscribe endpoint exists on the backend
    console.log('Newsletter signup:', email);
    this.newsletterEmail.set('');
  }
}
import { Component, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { HeroBannerComponent } from '../../components/hero-banner/hero-banner.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { productService } from '../../services/productService';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroBannerComponent, ProductCardComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private productService = inject(productService);

  // No isFeatured filter exists on the backend yet, so newest products
  // stand in for "featured" until that's added.
  featuredProducts = resource({
    loader: () => firstValueFrom(this.productService.getProducts())
  });
}
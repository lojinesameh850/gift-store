import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [NgFor, NgIf, ProductCardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {

  categories: any[] = [];
  tags: any[] = [];
  products: any[] = [];

  selectedCategories: string[] = [];
  selectedTags: string[] = [];
  selectedSort: string = 'newest';

  currentPage: number = 1;
  totalPages: number = 1;

  private http = inject(HttpClient);

  ngOnInit() {
    this.fetchCategories();
    this.fetchTags();
    this.fetchProducts();
  }

  fetchCategories() {
    const apiUrl = 'http://localhost:5000/api/categories';
    this.http.get<any>(apiUrl).subscribe({
      next: (res) => {
        this.categories = res?.data ?? res ?? [];
        console.log('Categories loaded:', this.categories);
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  fetchTags() {
    const apiUrl = 'http://localhost:5000/api/tags';
    this.http.get<any>(apiUrl).subscribe({
      next: (res) => {
        this.tags = res?.data ?? res ?? [];
        console.log('Tags loaded:', this.tags);
      },
      error: (err) => console.error('Error fetching tags:', err)
    });
  }

  fetchProducts() {
  let params = new HttpParams();

  if (this.selectedCategories && this.selectedCategories.length > 0) {
    params = params.set('category', this.selectedCategories[this.selectedCategories.length - 1]);
  }

  if (this.selectedTags && this.selectedTags.length > 0) {
    params = params.set('tags', this.selectedTags.join(','));
  }

  if (this.selectedSort) {
    params = params.set('sort', this.selectedSort);
  }

  if (this.selectedMinPrice !== null) {
      params = params.set('minPrice', this.selectedMinPrice.toString());
    }

    if (this.selectedMaxPrice !== null) {
      params = params.set('maxPrice', this.selectedMaxPrice.toString());
    }

  if (this.currentPage) {
    params = params.set('page', this.currentPage.toString());
  }

  const apiUrl = 'http://localhost:5000/api/products';

  this.http.get<any>(apiUrl, { params }).subscribe({
    next: (res) => {
      this.products = res?.data ?? [];
      this.currentPage = res?.currentPage ?? 1;
      this.totalPages = res?.totalPages ?? 1;
    },
    error: (err) => console.error('Error fetching products:', err)
  });
}
  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedSort = target.value;
    this.fetchProducts();
  }

  onCategorySelect(event: Event, category: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const categoryId = category._id || category.id;

    if (isChecked) {
      this.selectedCategories.push(categoryId);
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }

    this.fetchProducts();
  }

  onTagSelect(event: Event, tag: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const tagId = tag._id || tag.id;

    if (isChecked) {
      this.selectedTags.push(tagId);
    } else {
      this.selectedTags = this.selectedTags.filter(id => id !== tagId);
    }

    this.fetchProducts();
  }
  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.fetchProducts();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  selectedMinPrice: number | null = null;
  selectedMaxPrice: number | null = null;

  onPriceSelect(min: number | null, max: number | null) {
    this.selectedMinPrice = min;
    this.selectedMaxPrice = max;
    this.currentPage = 1;
    this.fetchProducts();
  }

}
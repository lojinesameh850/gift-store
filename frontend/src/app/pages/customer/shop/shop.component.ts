import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgFor } from '@angular/common';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import {
  productService,
  GetProductsParams,
} from '../../../services/productService';

@Component({
  selector: 'app-shop',
  imports: [NgFor, ProductCardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css',
})
export class ShopComponent implements OnInit {
  categories: any[] = [];
  selectedCategories: string[] = [];
  tags: any[] = [];
  selectedTags: string[] = [];

  selectedPriceRanges: { min?: number; max?: number; key: string }[] = [];

  selectedSort: 'lowest-price' | 'highest-price' | 'newest' | 'oldest' =
    'newest';

  products: any[] = [];

  private http = inject(HttpClient);
  private productService = inject(productService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.fetchCategories();
    this.fetchTags();
    this.fetchProducts();
  }

  fetchProducts() {
    const params: GetProductsParams = {
      sort: this.selectedSort,
    };

    if (this.selectedCategories.length > 0) {
      params.category = this.selectedCategories[0];
    }

    if (this.selectedTags.length > 0) {
      params.tags = this.selectedTags.join(',');
    }

    if (this.selectedPriceRanges.length > 0) {
      const mins = this.selectedPriceRanges
        .map((r) => r.min)
        .filter((v) => v !== undefined) as number[];
      const maxs = this.selectedPriceRanges
        .map((r) => r.max)
        .filter((v) => v !== undefined) as number[];

      if (mins.length > 0) params.minPrice = Math.min(...mins);
      if (maxs.length > 0) params.maxPrice = Math.max(...maxs);
    }

    this.productService.getProducts(params).subscribe({
      next: (data) => {
        console.log('✅ Products Loaded Successfully:', data);
        this.products = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ API Error Failure:', error);
      },
    });
  }

  fetchCategories() {
    const apiUrl = 'http://localhost:5000/api/categories';
    this.http.get<any>(apiUrl).subscribe({
      next: (res) => {
        this.categories = res?.data ?? res ?? [];
        this.cdr.detectChanges();
      },
    });
  }

  fetchTags() {
    const apiUrl = 'http://localhost:5000/api/tags';
    this.http.get<any>(apiUrl).subscribe({
      next: (res) => {
        this.tags = res?.data ?? res ?? [];
        this.cdr.detectChanges();
      },
    });
  }

  onCategorySelect(event: Event, category: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const categoryId = category._id || category.id;

    if (isChecked) {
      this.selectedCategories = [categoryId];
    } else {
      this.selectedCategories = [];
    }

    this.fetchProducts();
  }

  onTagSelect(event: Event, tag: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const tagId = tag._id || tag.id;

    if (isChecked) {
      this.selectedTags.push(tagId);
    } else {
      this.selectedTags = this.selectedTags.filter((id) => id !== tagId);
    }

    this.fetchProducts();
  }

  onPriceRangeSelect(event: Event, rangeKey: string) {
    const isChecked = (event.target as HTMLInputElement).checked;

    let rangeObj: { min?: number; max?: number; key: string } = {
      key: rangeKey,
    };
    if (rangeKey === 'under-250') rangeObj = { max: 250, key: rangeKey };
    else if (rangeKey === '250-500')
      rangeObj = { min: 250, max: 500, key: rangeKey };
    else if (rangeKey === '500-1000')
      rangeObj = { min: 500, max: 1000, key: rangeKey };
    else if (rangeKey === 'above-1000') rangeObj = { min: 1000, key: rangeKey };

    if (isChecked) {
      this.selectedPriceRanges.push(rangeObj);
    } else {
      this.selectedPriceRanges = this.selectedPriceRanges.filter(
        (r) => r.key !== rangeKey,
      );
    }

    this.fetchProducts();
  }

  onSortChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedSort = selectedValue as any;
    this.fetchProducts();
  }
}
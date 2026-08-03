import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';

import { adminProductService, product } from '../../../services/admin/adminProductService';
import { adminCategoryService, category } from '../../../services/admin/adminCategoryService';
import { adminTagService, tag } from '../../../services/admin/adminTagService';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    TagModule,
    InputNumberModule,
    CheckboxModule,
    MultiSelectModule,
    TextareaModule
  ],
  templateUrl: './adminProductsPage.html',
  styleUrl: './adminProductsPage.css'
})
export class adminProductsPageComponent implements OnInit {
  products: product[] = [];
  categories: category[] = [];
  tags: tag[] = [];
  isLoading = true;

  total = 0;
  page = 1;
  limit = 10;

  searchTerm = '';
  private searchChanged = new Subject<string>();

  categoryOptions: { label: string; value: string }[] = [];
  selectedCategoryFilter: string | null = null;

  showModal = false;
  editingId: string | null = null;
  productForm!: FormGroup;
  isSaving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private productService: adminProductService,
    private categoryService: adminCategoryService,
    private tagService: adminTagService
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: [null, Validators.required],
      tags: [[]],
      stock: [0, [Validators.required, Validators.min(0)]],
      isFeatured: [false],
      isActive: [true]
    });

    this.searchChanged.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.loadProducts();
    });

    this.loadFilters();
    this.loadProducts();
  }

  private loadFilters(): void {
    this.categoryService.getAll().subscribe({
      next: (res: { data: category[] }) => {
        this.categories = res.data;
        this.categoryOptions = res.data.map((c: category) => ({ label: c.name, value: c._id }));
      },
      error: (err: any) => console.error('Failed to load categories:', err)
    });

    this.tagService.getAll().subscribe({
      next: (res: { data: tag[] }) => (this.tags = res.data),
      error: (err: any) => console.error('Failed to load tags:', err)
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService
      .getAll({
        search: this.searchTerm || undefined,
        category: this.selectedCategoryFilter || undefined,
        page: this.page,
        limit: this.limit
      })
      .subscribe({
        next: (res: { data: product[]; total: number }) => {
          this.products = res.data;
          this.total = res.total;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Failed to load products:', err);
          this.isLoading = false;
        }
      });
  }

  onSearchInput(valueOrEvent: string | Event): void {
    let query = '';
    if (typeof valueOrEvent === 'string') {
      query = valueOrEvent;
    } else if (valueOrEvent && valueOrEvent.target) {
      query = (valueOrEvent.target as HTMLInputElement).value;
    }

    this.searchTerm = query;
    this.searchChanged.next(query);
  }

  onCategoryFilterChange(): void {
    this.page = 1;
    this.loadProducts();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.page = Math.floor(event.first / event.rows) + 1;
    this.limit = event.rows;
    this.loadProducts();
  }

  categoryName(cat: product['category']): string {
    if (!cat) return '—';
    return typeof cat === 'string' ? cat : cat.name;
  }

  stockStatus(stock: number): { label: string; severity: 'success' | 'warn' | 'danger' } {
    if (stock === 0) return { label: 'Out of Stock', severity: 'danger' };
    if (stock < 10) return { label: 'Low Stock', severity: 'warn' };
    return { label: 'In Stock', severity: 'success' };
  }

  openAddModal(): void {
    this.editingId = null;
    this.errorMessage = '';
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      category: null,
      tags: [],
      stock: 0,
      isFeatured: false,
      isActive: true
    });
    this.showModal = true;
  }

  openEditModal(p: product): void {
    this.editingId = p._id;
    this.errorMessage = '';
    this.productForm.patchValue({
      name: p.name,
      description: p.description,
      price: p.price,
      category: typeof p.category === 'string' ? p.category : p.category._id,
      tags: p.tags ? p.tags.map((t: any) => (typeof t === 'string' ? t : t._id)) : [],
      stock: p.stock,
      isFeatured: p.isFeatured,
      isActive: p.isActive
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = null;
  }

  onSave(): void {
    if (this.productForm.invalid) return;
    this.isSaving = true;
    this.errorMessage = '';

    const payload = this.productForm.value;
    const request = this.editingId
      ? this.productService.update(this.editingId, payload)
      : this.productService.create(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadProducts();
      },
      error: (err: any) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'Failed to save product.';
      }
    });
  }

  onDelete(p: product): void {
    if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;

    this.productService.delete(p._id).subscribe({
      next: () => this.loadProducts(),
      error: (err: any) => {
        console.error('Failed to delete product:', err);
        alert(err?.error?.message || 'Failed to delete product.');
      }
    });
  }
}

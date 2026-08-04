import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { adminProductService, product } from '../../../services/admin/adminProductService';
import { adminCategoryService, category } from '../../../services/admin/adminCategoryService';
import { adminTagService, tag } from '../../../services/admin/adminTagService';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './adminProductsPage.html',
  styleUrl: './adminProductsPage.css'
})
export class adminProductsPageComponent implements OnInit {
  products = signal<product[]>([]);
  categories = signal<category[]>([]);
  tags = signal<tag[]>([]);
  isLoading = signal(true);

  total = signal(0);
  page = signal(1);
  limit = signal(10);

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit())));
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  searchTerm = signal('');
  private searchChanged = new Subject<string>();

  categoryOptions = signal<{ label: string; value: string }[]>([]);
  selectedCategoryFilter = signal<string | null>(null);

  showModal = signal(false);
  editingId = signal<string | null>(null);
  productForm!: FormGroup;
  isSaving = signal(false);
  errorMessage = signal('');

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
      tags: [[] as string[]],
      stock: [0, [Validators.required, Validators.min(0)]],
      isFeatured: [false],
      isActive: [true]
    });

    this.searchChanged.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page.set(1);
      this.loadProducts();
    });

    this.loadFilters();
    this.loadProducts();
  }

  private loadFilters(): void {
    this.categoryService.getAll().subscribe({
      next: (res: { data: category[] }) => {
        this.categories.set(res.data);
        this.categoryOptions.set(res.data.map((c: category) => ({ label: c.name, value: c._id })));
      },
      error: (err: any) => console.error('Failed to load categories:', err)
    });

    this.tagService.getAll().subscribe({
      next: (res: { data: tag[] }) => this.tags.set(res.data),
      error: (err: any) => console.error('Failed to load tags:', err)
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService
      .getAll({
        search: this.searchTerm() || undefined,
        category: this.selectedCategoryFilter() || undefined,
        page: this.page(),
        limit: this.limit()
      })
      .subscribe({
        next: (res: { data: product[]; total: number }) => {
          this.products.set(res.data);
          this.total.set(res.total);
          this.isLoading.set(false);
        },
        error: (err: any) => {
          console.error('Failed to load products:', err);
          this.isLoading.set(false);
        }
      });
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchTerm.set(query);
    this.searchChanged.next(query);
  }

  onCategoryFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategoryFilter.set(value || null);
    this.page.set(1);
    this.loadProducts();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages() || p === this.page()) return;
    this.page.set(p);
    this.loadProducts();
  }

  prevPage(): void {
    this.goToPage(this.page() - 1);
  }

  nextPage(): void {
    this.goToPage(this.page() + 1);
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

  isTagSelected(id: string): boolean {
    const current: string[] = this.productForm.get('tags')?.value || [];
    return current.includes(id);
  }

  toggleTag(id: string): void {
    const control = this.productForm.get('tags');
    const current: string[] = control?.value || [];
    const next = current.includes(id) ? current.filter((t) => t !== id) : [...current, id];
    control?.setValue(next);
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.errorMessage.set('');
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
    this.showModal.set(true);
  }

  openEditModal(p: product): void {
    this.editingId.set(p._id);
    this.errorMessage.set('');
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
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  onSave(): void {
    if (this.productForm.invalid) return;
    this.isSaving.set(true);
    this.errorMessage.set('');

    const payload = this.productForm.value;
    const id = this.editingId();
    const request = id
      ? this.productService.update(id, payload)
      : this.productService.create(payload);

    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.loadProducts();
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to save product.');
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

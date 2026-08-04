import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { adminCategoryService, category } from '../../../services/admin/adminCategoryService';

interface categoryRow extends category {
  productCount: number | null; // null while still loading
  swatch: string;
}

// Purely a visual accent since the backend has no color field on Category -
// picked deterministically from the id so a given category always gets the same swatch.
const SWATCHES = ['#f6c9c1', '#f4e2a0', '#c9e4d1', '#c8d6f2', '#f3cbe6', '#d9c9f2', '#f0d9b5'];

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adminCategoriesPage.html',
  styleUrl: './adminCategoriesPage.css'
})
export class adminCategoriesPageComponent implements OnInit {
  categories = signal<categoryRow[]>([]);
  isLoading = signal(true);

  showModal = signal(false);
  editingId = signal<string | null>(null);
  categoryForm!: FormGroup;
  isSaving = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private categoryService: adminCategoryService
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isActive: [true]
    });
    this.loadCategories();
  }

  private swatchFor(id: string): string {
    const sum = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return SWATCHES[sum % SWATCHES.length];
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories.set(res.data.map((c) => ({ ...c, productCount: null, swatch: this.swatchFor(c._id) })));
        this.isLoading.set(false);
        this.loadProductCounts();
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Product counts are fetched separately (one lightweight call per category)
  // since the categories endpoint doesn't return them.
  private loadProductCounts(): void {
    const rows = this.categories();
    if (rows.length === 0) return;
    const calls = rows.map((c) => this.categoryService.getProductCount(c._id));
    forkJoin(calls).subscribe({
      next: (results) => {
        this.categories.update((current) =>
          current.map((c, i) => ({ ...c, productCount: results[i].total }))
        );
      },
      error: (err) => console.error('Failed to load product counts:', err)
    });
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.errorMessage.set('');
    this.categoryForm.reset({ name: '', description: '', isActive: true });
    this.showModal.set(true);
  }

  openEditModal(cat: categoryRow): void {
    this.editingId.set(cat._id);
    this.errorMessage.set('');
    this.categoryForm.patchValue({ name: cat.name, description: cat.description, isActive: cat.isActive });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  onSave(): void {
    if (this.categoryForm.invalid) return;
    this.isSaving.set(true);
    this.errorMessage.set('');

    const payload = this.categoryForm.value;
    const id = this.editingId();
    const request = id
      ? this.categoryService.update(id, payload)
      : this.categoryService.create(payload);

    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to save category.');
      }
    });
  }

  onDelete(cat: categoryRow): void {
    if (!confirm(`Delete "${cat.name}"? This can't be undone.`)) return;

    this.categoryService.delete(cat._id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => {
        console.error('Failed to delete category:', err);
        alert(err?.error?.message || 'Failed to delete category.');
      }
    });
  }
}

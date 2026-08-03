import { Component, OnInit } from '@angular/core';
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
  categories: categoryRow[] = [];
  isLoading = true;

  showModal = false;
  editingId: string | null = null;
  categoryForm!: FormGroup;
  isSaving = false;
  errorMessage = '';

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
    this.isLoading = true;
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories = res.data.map((c) => ({ ...c, productCount: null, swatch: this.swatchFor(c._id) }));
        this.isLoading = false;
        this.loadProductCounts();
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.isLoading = false;
      }
    });
  }

  // Product counts are fetched separately (one lightweight call per category)
  // since the categories endpoint doesn't return them.
  private loadProductCounts(): void {
    if (this.categories.length === 0) return;
    const calls = this.categories.map((c) => this.categoryService.getProductCount(c._id));
    forkJoin(calls).subscribe({
      next: (results) => {
        results.forEach((res, i) => (this.categories[i].productCount = res.total));
      },
      error: (err) => console.error('Failed to load product counts:', err)
    });
  }

  openAddModal(): void {
    this.editingId = null;
    this.errorMessage = '';
    this.categoryForm.reset({ name: '', description: '', isActive: true });
    this.showModal = true;
  }

  openEditModal(cat: categoryRow): void {
    this.editingId = cat._id;
    this.errorMessage = '';
    this.categoryForm.patchValue({ name: cat.name, description: cat.description, isActive: cat.isActive });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = null;
  }

  onSave(): void {
    if (this.categoryForm.invalid) return;
    this.isSaving = true;
    this.errorMessage = '';

    const payload = this.categoryForm.value;
    const request = this.editingId
      ? this.categoryService.update(this.editingId, payload)
      : this.categoryService.create(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'Failed to save category.';
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

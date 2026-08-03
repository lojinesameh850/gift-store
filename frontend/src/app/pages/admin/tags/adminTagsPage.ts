import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { adminTagService, tag } from '../../../services/admin/adminTagService';

interface tagRow extends tag {
  productCount: number | null; // null while still loading
  swatch: string;
}

// Same accent trick as the categories page - Tag has no color field,
// so the swatch is derived deterministically from the id.
const SWATCHES = ['#f6c9c1', '#f4e2a0', '#c9e4d1', '#c8d6f2', '#f3cbe6', '#d9c9f2', '#f0d9b5'];

@Component({
  selector: 'app-admin-tags',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adminTagsPage.html',
  styleUrl: './adminTagsPage.css'
})
export class adminTagsPageComponent implements OnInit {
  tags: tagRow[] = [];
  isLoading = true;

  showModal = false;
  editingId: string | null = null;
  tagForm!: FormGroup;
  isSaving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private tagService: adminTagService
  ) {}

  ngOnInit(): void {
    this.tagForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isActive: [true]
    });
    this.loadTags();
  }

  private swatchFor(id: string): string {
    const sum = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return SWATCHES[sum % SWATCHES.length];
  }

  loadTags(): void {
    this.isLoading = true;
    this.tagService.getAll().subscribe({
      next: (res) => {
        this.tags = res.data.map((t) => ({ ...t, productCount: null, swatch: this.swatchFor(t._id) }));
        this.isLoading = false;
        this.loadProductCounts();
      },
      error: (err) => {
        console.error('Failed to load tags:', err);
        this.isLoading = false;
      }
    });
  }

  // Product counts are fetched separately (one lightweight call per tag)
  // since the tags endpoint doesn't return them.
  private loadProductCounts(): void {
    if (this.tags.length === 0) return;
    const calls = this.tags.map((t) => this.tagService.getProductCount(t._id));
    forkJoin(calls).subscribe({
      next: (results) => {
        results.forEach((res, i) => (this.tags[i].productCount = res.total));
      },
      error: (err) => console.error('Failed to load product counts:', err)
    });
  }

  openAddModal(): void {
    this.editingId = null;
    this.errorMessage = '';
    this.tagForm.reset({ name: '', description: '', isActive: true });
    this.showModal = true;
  }

  openEditModal(t: tagRow): void {
    this.editingId = t._id;
    this.errorMessage = '';
    this.tagForm.patchValue({ name: t.name, description: t.description, isActive: t.isActive });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = null;
  }

  onSave(): void {
    if (this.tagForm.invalid) return;
    this.isSaving = true;
    this.errorMessage = '';

    const payload = this.tagForm.value;
    const request = this.editingId
      ? this.tagService.update(this.editingId, payload)
      : this.tagService.create(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadTags();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'Failed to save tag.';
      }
    });
  }

  onDelete(t: tagRow): void {
    if (!confirm(`Delete "${t.name}"? This can't be undone.`)) return;

    this.tagService.delete(t._id).subscribe({
      next: () => this.loadTags(),
      error: (err) => {
        console.error('Failed to delete tag:', err);
        alert(err?.error?.message || 'Failed to delete tag.');
      }
    });
  }
}

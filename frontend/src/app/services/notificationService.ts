import { Injectable, signal } from '@angular/core';

export interface notification {
  id: number;
  type: 'error' | 'success';
  message: string;
}

const AUTO_DISMISS_MS = 5000;

// Holds the current list of toasts. A <app-toasts> component (not included
// here) would just read toasts() and render them; notificationInterceptor is
// the main producer for errors, components can call showSuccess() directly
// for page-specific confirmations (e.g. "Address saved").
@Injectable({ providedIn: 'root' })
export class notificationService {
  private nextId = 0;
  toasts = signal<notification[]>([]);

  showError(message: string): void {
    this.push('error', message);
  }

  showSuccess(message: string): void {
    this.push('success', message);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(type: notification['type'], message: string): void {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
  }
}

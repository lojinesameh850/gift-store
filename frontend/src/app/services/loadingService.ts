import { Injectable, computed, signal } from '@angular/core';

// Tracks how many HTTP requests are currently in flight, app-wide.
// loadingInterceptor increments/decrements this on every request; anything
// that wants a global "is something loading" flag (e.g. a top bar spinner in
// app.component.html) can just read isLoading().
@Injectable({ providedIn: 'root' })
export class loadingService {
  private pendingRequests = signal(0);

  isLoading = computed(() => this.pendingRequests() > 0);

  increment(): void {
    this.pendingRequests.update((count) => count + 1);
  }

  decrement(): void {
    this.pendingRequests.update((count) => Math.max(0, count - 1));
  }
}

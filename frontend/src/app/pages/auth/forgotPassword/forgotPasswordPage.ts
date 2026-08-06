import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { authService } from '../../../services/authService';

// How long to wait, after the user stops typing, before a validation hint
// is allowed to appear. Hints still disappear immediately once a field
// becomes valid - only the "showing an error" side is delayed, so we're
// not scolding someone mid-keystroke.
const VALIDATION_HINT_DELAY_MS = 1000;

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgotPasswordPage.html',
  styleUrl: './forgotPasswordPage.css'
})
export class forgotPasswordComponent {
  isSubmitting = signal(false);
  errorMessage = signal('');

  requestForm: FormGroup;
  emailErrorVisible = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: authService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    const email = this.requestForm.get('email')!;

    email.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (email.valid) {
        this.emailErrorVisible.set(false);
      }
    });

    email.valueChanges
      .pipe(debounceTime(VALIDATION_HINT_DELAY_MS), takeUntilDestroyed())
      .subscribe(() => {
        this.emailErrorVisible.set(email.invalid);
      });
  }

  onRequestCode(): void {
    if (this.isSubmitting()) return;

    // Touch the control so the field-level hint below the input becomes
    // visible - otherwise submitting a blank/invalid email leaves the
    // button disabled with no visible explanation. On a submit attempt we
    // want that feedback immediately, not after the usual 1s typing-pause
    // delay, so the signal is forced on directly.
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      this.emailErrorVisible.set(this.requestForm.get('email')!.invalid);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    const email = this.requestForm.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // Only route to verify-otp once the send actually succeeded - email
        // travels via router state, not a query param, so it isn't exposed
        // in the URL/browser history bar.
        this.router.navigateByUrl('/auth/verify-otp', { state: { email } });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Could not send a reset code. Please try again.');
      }
    });
  }
}
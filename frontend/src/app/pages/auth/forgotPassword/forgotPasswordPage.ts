import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { authService } from '../../../services/authService';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgotPasswordPage.html',
  styleUrl: './forgotPasswordPage.css'
})
export class forgotPasswordComponent {
  isSubmitting = false;
  errorMessage = '';

  requestForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: authService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onRequestCode(): void {
    if (this.requestForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    const email = this.requestForm.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isSubmitting = false;
        // Only route to verify-otp once the send actually succeeded - email
        // travels via router state, not a query param, so it isn't exposed
        // in the URL/browser history bar.
        this.router.navigateByUrl('/auth/verify-otp', { state: { email } });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Could not send a reset code. Please try again.';
      }
    });
  }
}

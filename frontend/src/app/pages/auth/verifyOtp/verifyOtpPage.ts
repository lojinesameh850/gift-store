import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { authService } from '../../../services/authService';

type step = 'verify' | 'reset' | 'done';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword');

  if (confirmPassword && confirmPassword.value && confirmPassword.value !== password) {
    confirmPassword.setErrors({ ...confirmPassword.errors, mismatch: true });
  } else if (confirmPassword?.errors) {
    const { mismatch, ...rest } = confirmPassword.errors;
    confirmPassword.setErrors(Object.keys(rest).length ? rest : null);
  }

  return null;
}

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verifyOtpPage.html',
  styleUrl: './verifyOtpPage.css'
})
export class verifyOtpComponent implements OnInit {
  step = signal<step>('verify');
  isSubmitting = signal(false);
  errorMessage = signal('');

  // Carried in from forgotPasswordPage via router navigation state - the
  // email the code was sent to, and the short-lived resetToken issued once
  // the OTP is verified.
  private email = '';
  private resetToken = '';

  verifyForm: FormGroup;
  resetForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: authService,
    private router: Router
  ) {
    // getCurrentNavigation() is only populated during the navigation itself,
    // so it has to be read here in the constructor - by ngOnInit it's null.
    // history.state is the fallback for a page refresh, since browsers keep
    // pushState state across reloads.
    const navigation = this.router.getCurrentNavigation();
    this.email = navigation?.extras.state?.['email'] ?? history.state?.email ?? '';

    this.verifyForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    // No email in flight means there's nothing to verify - e.g. someone
    // typed this URL directly rather than arriving from a successful
    // "send code" request.
    if (!this.email) {
      this.router.navigateByUrl('/auth/forgot-password');
    }
  }

  onVerifyCode(): void {
    if (this.isSubmitting()) return;

    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.verifyOtp(this.email, this.verifyForm.value.otp).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.resetToken = res.data.resetToken;
        this.step.set('reset');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid or expired code.');
      }
    });
  }

  onResetPassword(): void {
    if (this.isSubmitting()) return;

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.resetPassword(this.resetToken, this.resetForm.value.newPassword).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.step.set('done');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Could not reset your password. Please request a new code.');
      }
    });
  }

  // Lets the user fix a mistyped email by going back to request a fresh code.
  backToRequest(): void {
    this.router.navigateByUrl('/auth/forgot-password');
  }
}
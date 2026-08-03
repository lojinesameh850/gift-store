import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { authService } from '../../../services/authService';

// Cross-field validator: flags the confirmPassword control itself (not the
// group) so *ngIf="confirmPassword.errors?.['mismatch']" works the same way
// the rest of this codebase checks individual control errors.
function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registerPage.html',
  styleUrl: './registerPage.css'
})
export class registerComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: authService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordsMatchValidator }
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const { confirmPassword, ...payload } = this.registerForm.getRawValue();

    this.authService.register(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        // register() already stores the session, so this is a real logged-in
        // redirect - not just a "go log in now" bounce.
        this.router.navigateByUrl('/account/profile');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
      }
    });
  }
}

import { Component, signal } from '@angular/core';
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
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { authService } from '../../../services/authService';

// How long to wait, after the user stops typing, before a validation hint
// is allowed to appear. Hints still disappear immediately once a field
// becomes valid - only the "showing an error" side is delayed, so we're
// not scolding someone mid-keystroke.
const VALIDATION_HINT_DELAY_MS = 1000;

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
  isSubmitting = signal(false);
  errorMessage = signal('');

  firstNameErrorVisible = signal(false);
  lastNameErrorVisible = signal(false);
  emailErrorVisible = signal(false);
  passwordErrorVisible = signal(false);
  confirmPasswordErrorVisible = signal(false);

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

    this.watchField('firstName', this.firstNameErrorVisible);
    this.watchField('lastName', this.lastNameErrorVisible);
    this.watchField('email', this.emailErrorVisible);
    this.watchField('password', this.passwordErrorVisible);
    this.watchField('confirmPassword', this.confirmPasswordErrorVisible);

    // The mismatch error is set by the group validator whenever password
    // changes too, not just confirmPassword's own valueChanges - so also
    // re-check confirmPassword's visibility whenever password changes.
    this.registerForm.get('password')!.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const confirmPassword = this.registerForm.get('confirmPassword')!;
      if (confirmPassword.valid) {
        this.confirmPasswordErrorVisible.set(false);
      }
    });
    this.registerForm
      .get('password')!
      .valueChanges.pipe(debounceTime(VALIDATION_HINT_DELAY_MS), takeUntilDestroyed())
      .subscribe(() => {
        const confirmPassword = this.registerForm.get('confirmPassword')!;
        this.confirmPasswordErrorVisible.set(confirmPassword.invalid);
      });
  }

  // Wires up a form control so its hint visibility signal:
  // - clears immediately the moment the field becomes valid, and
  // - only turns on (revealing the hint) after the user pauses typing
  //   for VALIDATION_HINT_DELAY_MS while the field is still invalid.
  private watchField(name: string, visible: ReturnType<typeof signal<boolean>>): void {
    const control = this.registerForm.get(name)!;

    control.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (control.valid) {
        visible.set(false);
      }
    });

    control.valueChanges
      .pipe(debounceTime(VALIDATION_HINT_DELAY_MS), takeUntilDestroyed())
      .subscribe(() => {
        visible.set(control.invalid);
      });
  }

  onSubmit(): void {
    if (this.isSubmitting()) return;

    // Touch every control so *ngIf="control.touched && control.invalid" hints
    // become visible - without this, a field a user never focused (e.g. they
    // never clicked into "Last Name") stays invalid with zero on-screen
    // explanation, and the submit button just silently stays disabled.
    // On a submit attempt we want that feedback immediately, not after the
    // usual 1s typing-pause delay, so the signals are forced on directly.
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.firstNameErrorVisible.set(this.registerForm.get('firstName')!.invalid);
      this.lastNameErrorVisible.set(this.registerForm.get('lastName')!.invalid);
      this.emailErrorVisible.set(this.registerForm.get('email')!.invalid);
      this.passwordErrorVisible.set(this.registerForm.get('password')!.invalid);
      this.confirmPasswordErrorVisible.set(this.registerForm.get('confirmPassword')!.invalid);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { confirmPassword, ...payload } = this.registerForm.getRawValue();

    this.authService.register(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // register() already stores the session, so this is a real logged-in
        // redirect - not just a "go log in now" bounce.
        this.router.navigateByUrl('/account/profile');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Something went wrong. Please try again.');
      }
    });
  }
}
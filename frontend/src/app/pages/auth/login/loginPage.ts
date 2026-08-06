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
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './loginPage.html',
  styleUrl: './loginPage.css'
})
export class loginComponent {
  loginForm: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');

  emailErrorVisible = signal(false);
  passwordErrorVisible = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: authService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.watchField('email', this.emailErrorVisible);
    this.watchField('password', this.passwordErrorVisible);
  }

  // Wires up a form control so its hint visibility signal:
  // - clears immediately the moment the field becomes valid, and
  // - only turns on (revealing the hint) after the user pauses typing
  //   for VALIDATION_HINT_DELAY_MS while the field is still invalid.
  private watchField(name: string, visible: ReturnType<typeof signal<boolean>>): void {
    const control = this.loginForm.get(name)!;

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

    // Touch every control so the field-level hints in the template become
    // visible - otherwise an untouched invalid field (e.g. an empty
    // password) leaves the button disabled with no visible explanation.
    // On a submit attempt we want that feedback immediately, not after the
    // usual 1s typing-pause delay, so the signals are forced on directly.
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.emailErrorVisible.set(this.loginForm.get('email')!.invalid);
      this.passwordErrorVisible.set(this.loginForm.get('password')!.invalid);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        const destination = res.data.role === 'admin' ? '/admin' : '/account/profile';
        this.router.navigateByUrl(destination);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password. Please try again.');
      }
    });
  }
}
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ResetPasswordRequest, VerifyResetCodeRequest } from '../../models/forgot-password.interface';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  resetPasswordForm: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);
  email = signal<string>('');
  step = signal<'verify' | 'reset'>('verify');

  constructor() {
    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      resetCode: ['', [Validators.required, Validators.minLength(4)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get email from query params
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email.set(params['email']);
        this.resetPasswordForm.patchValue({ email: params['email'] });
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onVerifyCode(): void {
    if (this.resetPasswordForm.get('email')?.valid && this.resetPasswordForm.get('resetCode')?.valid) {
      this.loading.set(true);
      this.error.set(null);

      const verifyData: VerifyResetCodeRequest = {
        email: this.resetPasswordForm.value.email,
        resetCode: this.resetPasswordForm.value.resetCode
      };

      this.authService.verifyResetCode(verifyData).subscribe({
        next: (response) => {
          console.log('Verify reset code response:', response);
          this.step.set('reset');
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Verify reset code error:', error);
          this.error.set(error.error?.message || 'Invalid reset code. Please try again.');
          this.loading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onResetPassword(): void {
    if (this.resetPasswordForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const resetData: ResetPasswordRequest = {
        email: this.resetPasswordForm.value.email,
        resetCode: this.resetPasswordForm.value.resetCode,
        newPassword: this.resetPasswordForm.value.newPassword
      };

      this.authService.resetPassword(resetData).subscribe({
        next: (response) => {
          console.log('Reset password response:', response);
          this.success.set(true);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Reset password error:', error);
          this.error.set(error.error?.message || 'Failed to reset password. Please try again.');
          this.loading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.resetPasswordForm.controls).forEach(key => {
      const control = this.resetPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goBackToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  getFieldError(fieldName: string): string {
    const field = this.resetPasswordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ForgotPasswordRequest } from '../../models/forgot-password.interface';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  forgotPasswordForm: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);
  submittedEmail = signal<string>('');

  constructor() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const formData: ForgotPasswordRequest = {
        email: this.forgotPasswordForm.value.email
      };

      this.authService.forgotPassword(formData).subscribe({
        next: (response) => {
          console.log('Forgot password response:', response);
          this.success.set(true);
          this.submittedEmail.set(formData.email);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Forgot password error:', error);
          this.error.set(error.error?.message || 'Failed to send reset code. Please try again.');
          this.loading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToResetPassword(): void {
    this.router.navigate(['/reset-password'], { 
      queryParams: { email: this.submittedEmail() } 
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }
}

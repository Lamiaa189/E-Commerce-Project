import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toastrService = inject(ToastrService);
  private readonly cookieService = inject(CookieService);

  isLoading = signal<boolean>(false);
  subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.initForm();
  }

  loginForm!: FormGroup;

  initForm(): void {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
    });
  }

  submitForm(): void {
    if (this.loginForm.valid) {
      this.subscription.unsubscribe();
      this.isLoading.set(true);
      this.subscription = this.authService.loginForm(this.loginForm.value).subscribe({
        next: (res) => {
          if (res.message === 'success') {
            this.cookieService.set('token', res.token)
            this.router.navigate(['/home']);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.toastrService.error(err.error.message);
          this.isLoading.set(false);
        },
      });
    }
  }
}

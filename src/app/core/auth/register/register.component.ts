import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { InputComponent } from "../../../shared/input/input.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, InputComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly toastrService = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showRePassword = signal<boolean>(false);
  registerForm!: FormGroup;
  subscription : Subscription = new Subscription();
  
  ngOnInit(): void {
    this.initForm();
  }

  initForm():void{
     this.registerForm= this.fb.group(
    {
      name: [null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.pattern(/^\w{6,}$/)]],
      rePassword: [null, [Validators.required]],
      phone: [null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    },
    { validators: this.confirmPassword }
  );
  }

  confirmPassword(group: AbstractControl) {
    if(group.get('password')?.value === group.get('rePassword')?.value) {
      return null;
    }
    group.get('rePassword')?.setErrors({ mismatch: true });
    return { mismatch: true };
  }

  submitForm(): void {
    if (this.registerForm.valid) {
      this.subscription.unsubscribe();
      this.isLoading.set(true);
      this.subscription = this.authService.registerForm(this.registerForm.value).subscribe({
        next: (res) => {
          if(res.message === 'success'){
            this.toastrService.success("User was created successfully.");
            setTimeout(() => {
              this.router.navigate(["/login"]);
            }, 1000);            
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

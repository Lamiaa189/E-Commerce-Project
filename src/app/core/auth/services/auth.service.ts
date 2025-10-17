import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { 
  ForgotPasswordRequest, 
  ForgotPasswordResponse, 
  ResetPasswordRequest, 
  ResetPasswordResponse,
  VerifyResetCodeRequest,
  VerifyResetCodeResponse
} from '../../models/forgot-password.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly cookieService = inject(CookieService);
  private readonly router = inject(Router);

  registerForm(data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}auth/signup`, data);
  }

  loginForm(data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}auth/signin`, data);
  }

  logout(): void {
    this.cookieService.delete('token');
    this.router.navigate(['/login']);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.httpClient.post<ForgotPasswordResponse>(`${environment.baseUrl}auth/forgotPasswords`, data);
  }

  verifyResetCode(data: VerifyResetCodeRequest): Observable<VerifyResetCodeResponse> {
    return this.httpClient.post<VerifyResetCodeResponse>(`${environment.baseUrl}auth/verifyResetCode`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.httpClient.put<ResetPasswordResponse>(`${environment.baseUrl}auth/resetPassword`, data);
  }
}

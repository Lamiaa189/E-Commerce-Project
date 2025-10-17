export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  status: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  resetCode: string;
}

export interface ResetPasswordResponse {
  message: string;
  status: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  resetCode: string;
}

export interface VerifyResetCodeResponse {
  message: string;
  status: string;
}

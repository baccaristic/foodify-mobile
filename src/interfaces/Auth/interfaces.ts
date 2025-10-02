export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: AuthResponse['user'] | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  applyAuthResponse: (response: AuthResponse) => Promise<void>;
  requiresAuth: boolean;
}

export interface User {
  id: string | number;
  name: string | null;
  email: string | null;
  phone?: string | null;
  role?: string;
  phoneVerified?: boolean | null;
  emailVerified?: boolean | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface OtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export type PhoneSignupNextStep =
  | 'VERIFY_PHONE_CODE'
  | 'PROVIDE_EMAIL'
  | 'PROVIDE_NAME'
  | 'ACCEPT_LEGAL_TERMS'
  | 'COMPLETED';

export interface PhoneSignupStateResponse {
  sessionId: string;
  phoneNumber: string;
  phoneVerified: boolean;
  emailProvided: boolean;
  nameProvided: boolean;
  termsAccepted: boolean;
  completed: boolean;
  nextStep: PhoneSignupNextStep;
  codeExpiresAt: string | null;
  resendAvailableAt: string | null;
  attemptsRemaining: number | null;
  resendsRemaining: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface CompletePhoneSignupResponse {
  state: PhoneSignupStateResponse;
  accessToken: string;
  refreshToken: string;
  user: User;
}
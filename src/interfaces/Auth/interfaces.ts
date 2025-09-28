export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User
}

export interface AuthState {
  user: AuthResponse["user"] | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
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
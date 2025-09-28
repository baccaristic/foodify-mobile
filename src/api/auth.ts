import {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  OtpRequest,
  VerifyOtpRequest,
  GoogleLoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
} from '~/interfaces/Auth/interfaces';
import client from './client';

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function requestOtp(payload: OtpRequest): Promise<{ success: boolean }> {
  const { data } = await client.post('/auth/request-otp', payload);
  return data;
}

export async function verifyOtp(payload: VerifyOtpRequest): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/verify-otp', payload);
  return data;
}

export async function loginWithGoogle(payload: GoogleLoginRequest): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/google', payload);
  return data;
}

export async function refreshToken(payload: RefreshTokenRequest): Promise<{ accessToken: string }> {
  const { data } = await client.post<{ accessToken: string }>('/auth/refresh', payload);
  return data;
}

export async function logout(payload: LogoutRequest): Promise<{ success: boolean }> {
  const { data } = await client.post<{ success: boolean }>('/auth/logout', payload);
  return data;
}

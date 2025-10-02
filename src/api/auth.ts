import {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  OtpRequest,
  VerifyOtpRequest,
  GoogleLoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  PhoneSignupStateResponse,
  CompletePhoneSignupResponse,
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

export async function startPhoneSignup(payload: { phoneNumber: string }): Promise<PhoneSignupStateResponse> {
  const { data } = await client.post<PhoneSignupStateResponse>('/api/auth/phone/start', payload);
  return data;
}

export async function verifyPhoneSignupCode(payload: {
  sessionId: string;
  code: string;
}): Promise<PhoneSignupStateResponse> {
  const { data } = await client.post<PhoneSignupStateResponse>('/api/auth/phone/verify', payload);
  return data;
}

export async function resendPhoneSignupCode(payload: { sessionId: string }): Promise<PhoneSignupStateResponse> {
  const { data } = await client.post<PhoneSignupStateResponse>('/api/auth/phone/resend', payload);
  return data;
}

export async function providePhoneSignupEmail(payload: {
  sessionId: string;
  email: string;
}): Promise<PhoneSignupStateResponse> {
  const { data } = await client.post<PhoneSignupStateResponse>('/api/auth/phone/email', payload);
  return data;
}

export async function providePhoneSignupName(payload: {
  sessionId: string;
  firstName: string;
  lastName: string;
}): Promise<PhoneSignupStateResponse> {
  const { data } = await client.post<PhoneSignupStateResponse>('/api/auth/phone/name', payload);
  return data;
}

export async function acceptPhoneSignupTerms(payload: {
  sessionId: string;
  accepted: boolean;
}): Promise<CompletePhoneSignupResponse> {
  const { data } = await client.post<CompletePhoneSignupResponse>('/api/auth/phone/accept', payload);
  return data;
}

export async function getPhoneSignupState(sessionId: string): Promise<PhoneSignupStateResponse> {
  const { data } = await client.get<PhoneSignupStateResponse>(`/api/auth/phone/${sessionId}`);
  return data;
}

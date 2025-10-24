import client from './client';
import type { User } from '~/interfaces/Auth/interfaces';

export interface UpdateClientProfileRequest {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  dateOfBirth?: string | null;
}

export const updateClientProfile = async (payload: UpdateClientProfileRequest) => {
  const { data } = await client.put<User>('/auth/client/profile', payload);
  return data;
};


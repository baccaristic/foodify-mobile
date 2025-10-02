import client from './client';
import type { SaveAddressRequest, SavedAddressResponse } from '~/interfaces/Address';

export const getMySavedAddresses = async (): Promise<SavedAddressResponse[]> => {
  const { data } = await client.get<SavedAddressResponse[]>('/addresses/mySavedAddresses');
  return data;
};

export const createAddress = async (payload: SaveAddressRequest): Promise<SavedAddressResponse> => {
  const { data } = await client.post<SavedAddressResponse>('/addresses', payload);
  return data;
};

export const updateAddress = async (
  addressId: string,
  payload: SaveAddressRequest,
): Promise<SavedAddressResponse> => {
  const { data } = await client.put<SavedAddressResponse>(`/addresses/${addressId}`, payload);
  return data;
};

export type AddressType = 'HOME' | 'APARTMENT' | 'WORK' | 'OTHER';

export interface CoordinatesDto {
  latitude: number;
  longitude: number;
  geohash?: string | null;
}

export interface SaveAddressRequest {
  userId?: string | null;
  type: AddressType;
  label?: string | null;
  coordinates: CoordinatesDto;
  formattedAddress: string;
  placeId?: string | null;
  entrancePreference?: string | null;
  entranceNotes?: string | null;
  directions?: string | null;
  notes?: string | null;
  isPrimary?: boolean | null;
  typeDetails?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export interface SavedAddressResponse {
  id: string;
  userId: number;
  type: AddressType;
  label?: string | null;
  coordinates: CoordinatesDto;
  formattedAddress: string;
  placeId?: string | null;
  entrancePreference?: string | null;
  entranceNotes?: string | null;
  directions?: string | null;
  notes?: string | null;
  primary: boolean;
  typeDetails?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

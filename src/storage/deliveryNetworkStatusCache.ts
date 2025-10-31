import * as SecureStore from 'expo-secure-store';
import type { DeliveryNetworkStatus } from '~/interfaces/DeliveryStatus';

const CACHE_KEY = 'delivery-network-status:last-known';
const ACKNOWLEDGED_KEY = 'delivery-network-status:last-acknowledged';

type CachedStatusPayload = {
  status: DeliveryNetworkStatus;
  updatedAt: number;
};

const serializePayload = (payload: CachedStatusPayload) => JSON.stringify(payload);

const deserializePayload = (value: string | null): CachedStatusPayload | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<CachedStatusPayload>;

    if (typeof parsed.status === 'string') {
      return {
        status: parsed.status as DeliveryNetworkStatus,
        updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
      };
    }
  } catch {
    // ignore invalid payloads
  }

  return null;
};

export const getCachedDeliveryStatus = async (): Promise<DeliveryNetworkStatus | null> => {
  try {
    const rawValue = await SecureStore.getItemAsync(CACHE_KEY);
    const payload = deserializePayload(rawValue);

    return payload?.status ?? null;
  } catch {
    return null;
  }
};

export const setCachedDeliveryStatus = async (
  status: DeliveryNetworkStatus,
): Promise<void> => {
  try {
    const payload: CachedStatusPayload = {
      status,
      updatedAt: Date.now(),
    };

    await SecureStore.setItemAsync(CACHE_KEY, serializePayload(payload));
  } catch {
    // ignore storage errors
  }
};

export const clearCachedDeliveryStatus = async (): Promise<void> => {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(CACHE_KEY),
      SecureStore.deleteItemAsync(ACKNOWLEDGED_KEY),
    ]);
  } catch {
    // ignore storage errors
  }
};

export const getAcknowledgedDeliveryStatus = async (): Promise<DeliveryNetworkStatus | null> => {
  try {
    const rawValue = await SecureStore.getItemAsync(ACKNOWLEDGED_KEY);
    const payload = deserializePayload(rawValue);

    return payload?.status ?? null;
  } catch {
    return null;
  }
};

export const setAcknowledgedDeliveryStatus = async (
  status: DeliveryNetworkStatus,
): Promise<void> => {
  try {
    const payload: CachedStatusPayload = {
      status,
      updatedAt: Date.now(),
    };

    await SecureStore.setItemAsync(ACKNOWLEDGED_KEY, serializePayload(payload));
  } catch {
    // ignore storage errors
  }
};

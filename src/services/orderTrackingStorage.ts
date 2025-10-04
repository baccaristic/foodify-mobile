import * as SecureStore from 'expo-secure-store';

const ACTIVE_ORDER_ID_KEY = 'activeOrderId';

export const persistActiveOrderId = async (orderId: number | null) => {
  if (orderId == null) {
    await SecureStore.deleteItemAsync(ACTIVE_ORDER_ID_KEY);
    return;
  }

  await SecureStore.setItemAsync(ACTIVE_ORDER_ID_KEY, String(orderId));
};

export const loadActiveOrderId = async (): Promise<number | null> => {
  try {
    const stored = await SecureStore.getItemAsync(ACTIVE_ORDER_ID_KEY);
    if (!stored) {
      return null;
    }

    const parsed = Number(stored);
    return Number.isFinite(parsed) ? parsed : null;
  } catch (error) {
    console.warn('Failed to restore active order identifier.', error);
    return null;
  }
};

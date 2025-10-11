import * as SecureStore from 'expo-secure-store';
import type { NotificationPreferenceResponse, NotificationType } from '~/interfaces/Notifications';
import { NOTIFICATION_TYPES } from '~/interfaces/Notifications';

const CACHE_KEY = 'notification-preferences-cache';

type CachedPreference = NotificationPreferenceResponse;

const validTypes = new Set<NotificationType>(NOTIFICATION_TYPES);

function isValidPreference(value: unknown): value is CachedPreference {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<CachedPreference>;

  if (!candidate.type || !validTypes.has(candidate.type as NotificationType)) {
    return false;
  }

  if (typeof candidate.enabled !== 'boolean') {
    return false;
  }

  if (
    candidate.updatedAt != null &&
    typeof candidate.updatedAt !== 'string' &&
    !(candidate.updatedAt instanceof Date)
  ) {
    return false;
  }

  return true;
}

function normalisePreference(value: CachedPreference): CachedPreference {
  return {
    type: value.type,
    enabled: Boolean(value.enabled),
    updatedAt:
      value.updatedAt instanceof Date
        ? value.updatedAt.toISOString()
        : value.updatedAt ?? null,
  };
}

export async function loadNotificationPreferencesFromCache(): Promise<
  NotificationPreferenceResponse[] | null
> {
  try {
    const raw = await SecureStore.getItemAsync(CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    const valid = parsed.filter(isValidPreference).map((preference) => normalisePreference(preference));

    if (valid.length === 0) {
      return null;
    }

    return valid;
  } catch (error) {
    console.warn('Failed to load cached notification preferences', error);
    return null;
  }
}

export async function saveNotificationPreferencesToCache(
  preferences: NotificationPreferenceResponse[],
): Promise<void> {
  try {
    const payload = JSON.stringify(preferences.map(normalisePreference));
    await SecureStore.setItemAsync(CACHE_KEY, payload);
  } catch (error) {
    console.warn('Failed to persist notification preferences cache', error);
  }
}

export async function clearNotificationPreferencesCache(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear notification preferences cache', error);
  }
}

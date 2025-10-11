import client from './client';
import type {
  NotificationPreferenceResponse,
  NotificationPreferenceUpdate,
} from '~/interfaces/Notifications';

const PREFERENCES_ENDPOINT = '/api/notifications/preferences';

export async function getNotificationPreferences(): Promise<NotificationPreferenceResponse[]> {
  const response = await client.get<NotificationPreferenceResponse[]>(PREFERENCES_ENDPOINT);
  return response.data;
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferenceUpdate[],
): Promise<NotificationPreferenceResponse[]> {
  const response = await client.put<NotificationPreferenceResponse[]>(PREFERENCES_ENDPOINT, {
    preferences,
  });
  return response.data;
}

export async function enableAllNotificationPreferences(): Promise<NotificationPreferenceResponse[]> {
  const response = await client.post<NotificationPreferenceResponse[]>(
    `${PREFERENCES_ENDPOINT}/enable-all`,
  );
  return response.data;
}

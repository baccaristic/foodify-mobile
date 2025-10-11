export type NotificationType = 'ORDER_UPDATES' | 'MARKETING_PUSH' | 'MARKETING_EMAIL';

export const NOTIFICATION_TYPES: NotificationType[] = [
  'ORDER_UPDATES',
  'MARKETING_PUSH',
  'MARKETING_EMAIL',
];

export interface NotificationPreferenceResponse {
  type: NotificationType;
  enabled: boolean;
  updatedAt: string | null;
}

export interface NotificationPreferenceUpdate {
  type: NotificationType;
  enabled: boolean;
}

export interface NotificationPreferencesUpdateRequest {
  preferences: NotificationPreferenceUpdate[];
}

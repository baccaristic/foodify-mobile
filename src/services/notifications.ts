import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type PushNotificationPermissionResult = {
  granted: boolean;
  status: Notifications.PermissionStatus;
  canAskAgain: boolean;
  expoPushToken: string | null;
  isDevice: boolean;
  error?: string;
};

type PushPermissionOptions = {
  request: boolean;
};

export async function checkPushNotificationPermissions(): Promise<PushNotificationPermissionResult> {
  return evaluatePushNotificationPermissions({ request: false });
}

export async function requestPushNotificationPermissions(): Promise<PushNotificationPermissionResult> {
  return evaluatePushNotificationPermissions({ request: true });
}

async function evaluatePushNotificationPermissions(
  options: PushPermissionOptions,
): Promise<PushNotificationPermissionResult> {
  const { request } = options;
  const isDevice = Device.isDevice;

  if (!isDevice) {
    return {
      granted: false,
      status: 'undetermined',
      canAskAgain: false,
      expoPushToken: null,
      isDevice,
      error: 'Push notifications require a physical device.',
    };
  }

  try {
    let permissions = await Notifications.getPermissionsAsync();

    if (request && !permissions.granted && permissions.canAskAgain) {
      permissions = await Notifications.requestPermissionsAsync();
    }

    const granted = permissions.granted;
    let expoPushToken: string | null = null;
    let tokenError: string | undefined;

    if (granted) {
      await ensureAndroidChannel();

      try {
        const projectId = getProjectId();
        const response = projectId
          ? await Notifications.getExpoPushTokenAsync({ projectId })
          : await Notifications.getExpoPushTokenAsync();
        expoPushToken = response.data ?? null;
      } catch (error) {
        expoPushToken = null;
        tokenError = error instanceof Error ? error.message : 'Failed to fetch push token.';
      }
    }

    return {
      granted,
      status: permissions.status,
      canAskAgain: permissions.canAskAgain,
      expoPushToken,
      isDevice,
      error: tokenError,
    };
  } catch (error) {
    const fallbackMessage = request
      ? 'Failed to request notification permissions.'
      : 'Failed to check notification permissions.';

    return {
      granted: false,
      status: 'undetermined',
      canAskAgain: false,
      expoPushToken: null,
      isDevice,
      error: error instanceof Error ? error.message : fallbackMessage,
    };
  }
}

function getProjectId(): string | null {
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.expoConfig?.extra?.projectId ??
    Constants?.easConfig?.projectId ??
    null;

  return projectId ?? null;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
  });
}

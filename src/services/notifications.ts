import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { registerDevice } from '~/api/devices';

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
      await ensureOngoingOrderNotificationChannel();

      try {
        const projectId = getProjectId();
        const response = projectId
          ? await Notifications.getExpoPushTokenAsync({ projectId })
          : await Notifications.getExpoPushTokenAsync();
        expoPushToken = response.data ?? null;

        if (expoPushToken) {
          try {
            await registerDeviceWithBackend(expoPushToken);
          } catch (registrationError) {
            tokenError =
              registrationError instanceof Error
                ? registrationError.message
                : 'Failed to register device for push notifications.';
          }
        }
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

export const ONGOING_ORDER_NOTIFICATION_CHANNEL_ID = 'ongoing-order-status';

export async function ensureOngoingOrderNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ONGOING_ORDER_NOTIFICATION_CHANNEL_ID, {
    name: 'Ongoing orders',
    importance: Notifications.AndroidImportance.MAX,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableVibrate: true,
    bypassDnd: false,
  });
}

async function registerDeviceWithBackend(deviceToken: string) {
  const platform = Platform.OS;
  const deviceId = await resolveDeviceId();
  const appVersion =
    Application.nativeApplicationVersion ??
    Constants?.expoConfig?.version ??
    Constants?.expoConfig?.runtimeVersion ??
    'unknown';

  await registerDevice({
    deviceToken,
    platform,
    deviceId,
    appVersion,
  });
}

async function resolveDeviceId(): Promise<string> {
  try {
    if (Platform.OS === 'android' && Application.getAndroidId) {
      const androidId = Application.getAndroidId();
      if (androidId) {
        return androidId;
      }
    }

    if (Platform.OS === 'ios' && Application.getIosIdForVendorAsync) {
      const iosId = await Application.getIosIdForVendorAsync();
      if (iosId) {
        return iosId;
      }
    }
  } catch (error) {
    console.warn('Failed to retrieve native device identifier.', error);
  }

  return (
    Device.osInternalBuildId ??
    Device.osBuildId ??
    Device.modelId ??
    Device.deviceName ??
    'unknown'
  );
}

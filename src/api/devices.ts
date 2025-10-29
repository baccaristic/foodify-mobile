import client from './client';

export type DeviceRegistrationPayload = {
  deviceToken: string;
  platform: string;
  deviceId: string;
  appVersion: string;
};

export async function registerDevice(
  payload: DeviceRegistrationPayload,
): Promise<void> {
  await client.post('/devices/register', payload);
}

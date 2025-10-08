import client from './client';
import type { DriverShiftDto } from '~/interfaces/Driver/Shift';

export const getDriverShift = async () => {
  const response = await client.get<DriverShiftDto | null>('/api/driver/shift');
  return response.data;
};

export type GetDriverShiftResponse = Awaited<ReturnType<typeof getDriverShift>>;

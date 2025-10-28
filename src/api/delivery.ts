import client from './client';
import type { DeliveryNetworkStatusResponse } from '~/interfaces/DeliveryStatus';

export const getDeliveryNetworkStatus = async () => {
  const response = await client.get<DeliveryNetworkStatusResponse>('/delivery/status');
  return response.data;
};

export default getDeliveryNetworkStatus;

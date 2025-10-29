import client from './client';
import type {
  DeliveryRatingRequest,
  DeliveryRatingResponse,
  DeliveryRatingSummary,
} from '~/interfaces/DeliveryRating';

export const getDeliveryRating = async (orderId: number) => {
  const response = await client.get<DeliveryRatingResponse | DeliveryRatingSummary | null>(
    `/delivery/ratings/orders/${orderId}`,
  );

  if (response.status === 204 || response.data == null) {
    return null;
  }

  return response.data;
};

export const submitDeliveryRating = async (
  orderId: number,
  payload: DeliveryRatingRequest,
): Promise<DeliveryRatingResponse> => {
  const { data } = await client.post<DeliveryRatingResponse>(
    `/delivery/ratings/orders/${orderId}`,
    payload,
  );

  return data;
};

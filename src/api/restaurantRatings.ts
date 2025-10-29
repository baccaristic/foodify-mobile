import client from './client';
import type { RestaurantRatingRequest, RestaurantRatingResponse } from '~/interfaces/RestaurantRating';

export const getRestaurantRating = async (orderId: number) => {
  const response = await client.get<RestaurantRatingResponse | null>(
    `/client/restaurants/orders/${orderId}/ratings`,
  );

  if (response.status === 204 || response.data == null) {
    return null;
  }

  return response.data;
};

export const submitRestaurantRating = async (
  orderId: number,
  payload: RestaurantRatingRequest,
): Promise<RestaurantRatingResponse> => {
  const { data } = await client.post<RestaurantRatingResponse>(
    `/client/restaurants/orders/${orderId}/ratings`,
    payload,
  );

  return data;
};

import client from './client';
import type { NearbyRestaurantsParams, RestaurantSummary } from '~/interfaces/Restaurant';

export const getNearbyRestaurants = async ({ lat, lng, radiusKm = 1 }: NearbyRestaurantsParams): Promise<RestaurantSummary[]> => {
  const { data } = await client.get<RestaurantSummary[]>('/client/nearby', {
    params: {
      lat,
      lng,
      radiusKm,
    },
  });

  return data;
};

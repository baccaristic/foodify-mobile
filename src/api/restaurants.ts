import client from './client';
import type {
  NearbyRestaurantsParams,
  RestaurantDetailsResponse,
  RestaurantSearchParams,
  RestaurantSearchResponse,
  RestaurantSummary,
} from '~/interfaces/Restaurant';

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

export const getRestaurantDetails = async (id: number): Promise<RestaurantDetailsResponse> => {
  const { data } = await client.get<RestaurantDetailsResponse>(`/client/restaurant/${id}`);
  return data;
};

export const searchRestaurants = async (
  params: RestaurantSearchParams
): Promise<RestaurantSearchResponse> => {
  const { data } = await client.get<RestaurantSearchResponse>(`/client/restaurants/search`, {
    params,
  });

  return data;
};

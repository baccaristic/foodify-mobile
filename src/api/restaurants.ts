import client from './client';
import type {
  NearbyRestaurantsParams,
  PaginatedRestaurantSummaryResponse,
  RestaurantDetailsResponse,
  RestaurantSearchParams,
  RestaurantSearchResponse,
} from '~/interfaces/Restaurant';

export const getNearbyRestaurants = async ({
  lat,
  lng,
  radiusKm = 1,
  category,
  page,
  pageSize,
}: NearbyRestaurantsParams): Promise<PaginatedRestaurantSummaryResponse> => {
  const { data } = await client.get<PaginatedRestaurantSummaryResponse>('/client/nearby', {
    params: {
      lat,
      lng,
      radiusKm,
      category,
      page,
      pageSize,
    },
  });

  return data;
};

export const getRestaurantDetails = async ({ id, lat, lng }: { id: number; lat: number; lng: number }): Promise<RestaurantDetailsResponse> => {
  const { data } = await client.get<RestaurantDetailsResponse>(`/client/restaurant/${id}`, {
    params: {
      lat,
      lng,
    },
  });
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

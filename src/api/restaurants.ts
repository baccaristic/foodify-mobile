import client from './client';
import type {
  NearbyRestaurantsParams,
  NearbyRestaurantsResponse,
  RestaurantDetailsResponse,
  RestaurantSearchParams,
  RestaurantSearchResponse,
  CategoryRestaurantsResponse,
  RestaurantCategory,
} from '~/interfaces/Restaurant';

interface CategoryRestaurantsParams {
  lat: number;
  lng: number;
  categorie: RestaurantCategory;
  page?: number;
  size?: number;
  sort?: string;
}

export const getNearbyRestaurants = async ({
  lat,
  lng,
  radiusKm = 1,
  category,
  page,
  pageSize,
}: NearbyRestaurantsParams): Promise<NearbyRestaurantsResponse> => {
  const { data } = await client.get<NearbyRestaurantsResponse>('/client/nearby', {
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

export const getCategoryRestaurants = async ({
  lat,
  lng,
  categorie,
  page,
  size,
  sort,
}: CategoryRestaurantsParams): Promise<CategoryRestaurantsResponse> => {
  const safePage =
    typeof page === 'number' && Number.isFinite(page) && page >= 0
      ? Math.floor(page)
      : 0;
  const safeSize =
    typeof size === 'number' && Number.isFinite(size) && size > 0 ? Math.floor(size) : 10;

  const { data } = await client.get<CategoryRestaurantsResponse>(`/client/filter/categorie`, {
    params: {
      lat,
      lng,
      category: categorie,
      page: safePage,
      size: safeSize,
      sort,
    },
  });

  return data;
};

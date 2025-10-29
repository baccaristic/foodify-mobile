import client from './client';
import type {
  CategoryRestaurantsResponse,
  PageResponse,
  RestaurantCategory,
  RestaurantDeliveryFeeResponse,
  RestaurantDetailsResponse,
  RestaurantDisplayDto,
  RestaurantSearchParams,
  RestaurantSearchResponse,
} from '~/interfaces/Restaurant';

interface CategoryRestaurantsParams {
  lat: number;
  lng: number;
  categorie: RestaurantCategory;
  page?: number;
  size?: number;
  sort?: string;
}

interface NearbyCoordinatesParams {
  lat: number;
  lng: number;
}

interface NearbyRestaurantsPageParams extends NearbyCoordinatesParams {
  page?: number;
  pageSize?: number;
}

export const getNearbyTopRestaurants = async ({
  lat,
  lng,
}: NearbyCoordinatesParams): Promise<RestaurantDisplayDto[]> => {
  const { data } = await client.get<RestaurantDisplayDto[]>('/client/nearby/top', {
    params: {
      lat,
      lng,
    },
  });

  return data;
};

export const getNearbyFavoriteRestaurants = async ({
  lat,
  lng,
}: NearbyCoordinatesParams): Promise<RestaurantDisplayDto[]> => {
  const { data } = await client.get<RestaurantDisplayDto[]>(
    '/client/nearby/favorites',
    {
      params: {
        lat,
        lng,
      },
    }
  );

  return data;
};

export const getNearbyRecentOrderRestaurants = async ({
  lat,
  lng,
}: NearbyCoordinatesParams): Promise<RestaurantDisplayDto[]> => {
  const { data } = await client.get<RestaurantDisplayDto[]>(
    '/client/nearby/orders',
    {
      params: {
        lat,
        lng,
      },
    }
  );

  return data;
};

export const getNearbyRestaurantsPage = async ({
  lat,
  lng,
  page,
  pageSize,
}: NearbyRestaurantsPageParams): Promise<PageResponse<RestaurantDisplayDto>> => {
  const safePage =
    typeof page === 'number' && Number.isFinite(page) && page >= 0
      ? Math.floor(page)
      : 0;
  const safePageSize =
    typeof pageSize === 'number' && Number.isFinite(pageSize) && pageSize > 0
      ? Math.floor(pageSize)
      : 20;

  const { data } = await client.get<PageResponse<RestaurantDisplayDto>>(
    '/client/nearby/restaurants',
    {
      params: {
        lat,
        lng,
        page: safePage,
        pageSize: safePageSize,
      },
    }
  );

  return data;
};

export const getNearbyPromotionsPage = async ({
  lat,
  lng,
  page,
  pageSize,
}: NearbyRestaurantsPageParams): Promise<PageResponse<RestaurantDisplayDto>> => {
  const safePage =
    typeof page === 'number' && Number.isFinite(page) && page >= 0 ? Math.floor(page) : 0;
  const safePageSize =
    typeof pageSize === 'number' && Number.isFinite(pageSize) && pageSize > 0
      ? Math.floor(pageSize)
      : 20;

  const { data } = await client.get<PageResponse<RestaurantDisplayDto>>(
    '/client/nearby/promotions',
    {
      params: {
        lat,
        lng,
        page: safePage,
        pageSize: safePageSize,
      },
    }
  );

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

export const getRestaurantDeliveryFee = async ({
  restaurantId,
  lat,
  lng,
}: {
  restaurantId: number;
  lat: number;
  lng: number;
}): Promise<RestaurantDeliveryFeeResponse> => {
  const { data } = await client.get<RestaurantDeliveryFeeResponse>(
    `/client/restaurants/${restaurantId}/delivery-fee`,
    {
      params: {
        lat,
        lng,
      },
    },
  );

  return data;
};

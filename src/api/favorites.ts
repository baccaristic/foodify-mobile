import client from './client';

export const favoriteRestaurant = async (restaurantId: number): Promise<void> => {
  await client.post(`/client/favorites/restaurants/${restaurantId}`);
};

export const unfavoriteRestaurant = async (restaurantId: number): Promise<void> => {
  await client.delete(`/client/favorites/restaurants/${restaurantId}`);
};

export const favoriteMenuItem = async (menuItemId: number): Promise<void> => {
  await client.post(`/client/favorites/menu-items/${menuItemId}`);
};

export const unfavoriteMenuItem = async (menuItemId: number): Promise<void> => {
  await client.delete(`/client/favorites/menu-items/${menuItemId}`);
};

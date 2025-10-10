import type { RestaurantDetailsResponse } from '~/interfaces/Restaurant';

export const updateMenuItemFavoriteState = (
  data: RestaurantDetailsResponse,
  menuItemId: number,
  favorite: boolean
): RestaurantDetailsResponse => ({
  ...data,
  topSales: data.topSales?.map((item) => (item.id === menuItemId ? { ...item, favorite } : item)) ?? [],
  categories: data.categories.map((category) => ({
    ...category,
    items: category.items.map((item) => (item.id === menuItemId ? { ...item, favorite } : item)),
  })),
});

export const CATEGORY_LABEL_KEYS: Record<string, string> = {
  discount: 'home.categories.discount',
  'top restaurants': 'home.categories.topRestaurants',
  dishes: 'home.categories.dishes',
  pizza: 'home.categories.pizza',
  burger: 'home.categories.burger',
};

export const getCategoryLabelKey = (category: string): string | undefined =>
  CATEGORY_LABEL_KEYS[category.toLowerCase()];

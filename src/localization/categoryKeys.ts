import { RestaurantCategory } from '~/interfaces/Restaurant';

export const CATEGORY_LABEL_KEYS: Record<RestaurantCategory, string> = {
  [RestaurantCategory.ASIAN]: 'home.categories.asian',
  [RestaurantCategory.BAKERY]: 'home.categories.bakery',
  [RestaurantCategory.BREAKFAST]: 'home.categories.breakfast',
  [RestaurantCategory.BURGERS]: 'home.categories.burgers',
  [RestaurantCategory.CHICKEN]: 'home.categories.chicken',
  [RestaurantCategory.FAST_FOOD]: 'home.categories.fastFood',
  [RestaurantCategory.GRILL]: 'home.categories.grill',
  [RestaurantCategory.ICE_CREAM]: 'home.categories.iceCream',
  [RestaurantCategory.INDIAN]: 'home.categories.indian',
  [RestaurantCategory.INTERNATIONAL]: 'home.categories.international',
  [RestaurantCategory.ITALIAN]: 'home.categories.italian',
  [RestaurantCategory.MEXICAN]: 'home.categories.mexican',
  [RestaurantCategory.ORIENTAL]: 'home.categories.oriental',
  [RestaurantCategory.PASTA]: 'home.categories.pasta',
  [RestaurantCategory.PIZZA]: 'home.categories.pizza',
  [RestaurantCategory.SALDAS]: 'home.categories.salads',
  [RestaurantCategory.SADWICH]: 'home.categories.sandwiches',
  [RestaurantCategory.SEAFOOD]: 'home.categories.seafood',
  [RestaurantCategory.SNACKS]: 'home.categories.snacks',
  [RestaurantCategory.SUSHI]: 'home.categories.sushi',
  [RestaurantCategory.SWEETS]: 'home.categories.sweets',
  [RestaurantCategory.TACOS]: 'home.categories.tacos',
  [RestaurantCategory.TEA_COFFEE]: 'home.categories.teaCoffee',
  [RestaurantCategory.TRADITIONAL]: 'home.categories.traditional',
  [RestaurantCategory.TUNISIAN]: 'home.categories.tunisian',
  [RestaurantCategory.TURKISH]: 'home.categories.turkish',
};

const LEGACY_CATEGORY_LABEL_KEYS: Record<string, string> = {
  discount: 'home.categories.discount',
  'top restaurants': 'home.categories.topRestaurants',
  dishes: 'home.categories.dishes',
  pizza: 'home.categories.pizza',
  burger: 'home.categories.burger',
};

const isRestaurantCategory = (value: string): value is RestaurantCategory =>
  Object.prototype.hasOwnProperty.call(CATEGORY_LABEL_KEYS, value);

export const getCategoryLabelKey = (category: string): string | undefined => {
  const normalized = category.replace(/\s+/g, '_').toUpperCase();

  if (isRestaurantCategory(normalized)) {
    return CATEGORY_LABEL_KEYS[normalized];
  }

  return LEGACY_CATEGORY_LABEL_KEYS[category.toLowerCase()];
};

export const toCategoryDisplayName = (category: string): string =>
  category
    .replace(/[_\s]+/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)([a-z])/g, (_, space, letter: string) => `${space}${letter.toUpperCase()}`);

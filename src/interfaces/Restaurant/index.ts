export enum RestaurantCategory {
  ASIAN = 'ASIAN',
  BAKERY = 'BAKERY',
  BREAKFAST = 'BREAKFAST',
  BURGERS = 'BURGERS',
  CHICKEN = 'CHICKEN',
  FAST_FOOD = 'FAST_FOOD',
  GRILL = 'GRILL',
  ICE_CREAM = 'ICE_CREAM',
  INDIAN = 'INDIAN',
  INTERNATIONAL = 'INTERNATIONAL',
  ITALIAN = 'ITALIAN',
  MEXICAN = 'MEXICAN',
  ORIENTAL = 'ORIENTAL',
  PASTA = 'PASTA',
  PIZZA = 'PIZZA',
  SALDAS = 'SALDAS',
  SADWICH = 'SADWICH',
  SEAFOOD = 'SEAFOOD',
  SNACKS = 'SNACKS',
  SUSHI = 'SUSHI',
  SWEETS = 'SWEETS',
  TACOS = 'TACOS',
  TEA_COFFEE = 'TEA_COFFEE',
  TRADITIONAL = 'TRADITIONAL',
  TUNISIAN = 'TUNISIAN',
  TURKISH = 'TURKISH',
}

export interface RestaurantBadge {
  label: string;
  value: string;
}

export interface RestaurantDeliveryFeeResponse {
  available: boolean;
  distanceKm?: number | null;
  deliveryFee?: number | null;
}

export interface RestaurantMenuItemExtra {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  price: number;
  defaultOption: boolean;
}

export interface RestaurantMenuOptionGroup {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  minSelect: number;
  maxSelect: number;
  required: boolean;
  extras: RestaurantMenuItemExtra[];
}

export interface RestaurantMenuItemDetails {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  description: string;
  descriptionEn?: string;
  descriptionFr?: string;
  descriptionAr?: string;
  price: number;
  imageUrl: string;
  popular: boolean;
  tags: string[];
  optionGroups: RestaurantMenuOptionGroup[];
  promotionActive?: boolean;
  promotionPrice?: number | null;
  promotionLabel?: string | null;
  favorite?: boolean;
}

export interface RestaurantMenuCategory {
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  items: RestaurantMenuItemDetails[];
}

export interface RestaurantMenuItemSummary {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  description: string;
  descriptionEn?: string;
  descriptionFr?: string;
  descriptionAr?: string;
  price: number;
  imageUrl: string;
  popular: boolean;
  tags: string[];
  promotionActive?: boolean;
  promotionPrice?: number | null;
  promotionLabel?: string | null;
  favorite?: boolean;
}

export interface RestaurantDetailsResponse {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  description: string;
  descriptionEn?: string;
  descriptionFr?: string;
  descriptionAr?: string;
  deliveryFee: number;
  imageUrl: string;
  iconUrl?: string | null;
  address: string;
  phone: string;
  type: string;
  rating: string;
  openingHours: string;
  closingHours: string;
  latitude: number;
  longitude: number;
  highlights: RestaurantBadge[];
  quickFilters: string[];
  topSales: RestaurantMenuItemSummary[];
  categories: RestaurantMenuCategory[];
  cuisineCategories?: RestaurantCategory[];
  favorite?: boolean;
  estimatedDeliveryTime?: number;
}

export interface RestaurantSummary {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  address: string;
  deliveryFee: number;
  phone: string;
  type: string;
  rating: string;
  openingHours: string;
  closingHours: string;
  description: string;
  descriptionEn?: string;
  descriptionFr?: string;
  descriptionAr?: string;
  licenseNumber: string;
  taxId: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  iconUrl?: string | null;
  menu: RestaurantMenuItemDetails[];
  favorite?: boolean;
  hasPromotion?: boolean;
  promotionSummary?: string | null;
  categories?: RestaurantCategory[];
  cuisineCategories?: RestaurantCategory[];
  estimatedDeliveryTime?: number;
}

export interface RestaurantDisplayDto {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  descriptionAr?: string | null;
  address?: string | null;
  type?: string | null;
  rating?: string | number | null;
  deliveryFee?: number | null;
  openingHours?: string | null;
  closingHours?: string | null;
  imageUrl?: string | null;
  iconUrl?: string | null;
  favorite?: boolean;
  hasPromotion?: boolean;
  promotionSummary?: string | null;
  cuisineCategories?: RestaurantCategory[];
  estimatedDeliveryTime?: number;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export type RestaurantSearchSort = "picked" | "popular" | "rating";

export interface RestaurantSearchParams {
  lat: number;
  lng: number;
  query?: string;
  hasPromotion?: boolean;
  isTopChoice?: boolean;
  hasFreeDelivery?: boolean;
  sort?: RestaurantSearchSort;
  topEatOnly?: boolean;
  maxDeliveryFee?: number;
  page?: number;
  pageSize?: number;
}

export interface RestaurantSearchItem {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  deliveryTimeRange: string;
  deliveryFee: number;
  rating: number;
  isTopChoice: boolean;
  hasFreeDelivery: boolean;
  imageUrl: string;
  iconUrl?: string | null;
  promotedMenuItems?: MenuItemPromotion[];
  categories?: RestaurantCategory[];
  estimatedDeliveryTime?: number;
}

export interface RestaurantSearchResponse {
  items: RestaurantSearchItem[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface MenuItemPromotion {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  price: number;
  promotionPrice?: number | null;
  promotionLabel?: string | null;
  imageUrl: string;
}

export interface RestaurantDisplay {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  descriptionAr?: string | null;
  rating?: number | null;
  type?: string | null;
  address?: string | null;
  phone?: string | null;
  openingHours?: string | null;
  closingHours?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  deliveryFee?: number | null;
  imageUrl?: string | null;
  iconUrl?: string | null;
  favorite?: boolean | null;
  hasPromotion?: boolean | null;
  promotionSummary?: string | null;
  categories?: RestaurantCategory[] | null;
  estimatedDeliveryTime?: number;
}

export interface CategoryRestaurantsResponse {
  items: RestaurantDisplay[];
  page: number;
  pageSize: number;
  totalItems: number;
}

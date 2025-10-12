export interface RestaurantBadge {
  label: string;
  value: string;
}

export interface RestaurantMenuItemExtra {
  id: number;
  name: string;
  price: number;
  defaultOption: boolean;
}

export interface RestaurantMenuOptionGroup {
  id: number;
  name: string;
  minSelect: number;
  maxSelect: number;
  required: boolean;
  extras: RestaurantMenuItemExtra[];
}

export interface RestaurantMenuItemDetails {
  id: number;
  name: string;
  description: string;
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
  items: RestaurantMenuItemDetails[];
}

export interface RestaurantMenuItemSummary {
  id: number;
  name: string;
  description: string;
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
  description: string;
  deliveryFee: number;
  imageUrl: string;
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
  favorite?: boolean;
}

export interface RestaurantSummary {
  id: number;
  name: string;
  address: string;
  deliveryFee: number;
  phone: string;
  type: string;
  rating: string;
  openingHours: string;
  closingHours: string;
  description: string;
  licenseNumber: string;
  taxId: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  menu: RestaurantMenuItemDetails[];
  favorite?: boolean;
}

export interface NearbyRestaurantsParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface RestaurantCategorySection {
  displayType: string;
  restaurants: RestaurantSummary[];
}

export interface PaginatedRestaurantCategorySection extends RestaurantCategorySection {
  page: number;
  pageSize: number;
  totalElements: number;
}

export interface NearbyRestaurantsResponse {
  topPicks?: RestaurantCategorySection;
  orderAgain?: RestaurantCategorySection;
  promotions?: RestaurantCategorySection;
  others: PaginatedRestaurantCategorySection;
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
  deliveryTimeRange: string;
  deliveryFee: number;
  rating: number;
  isTopChoice: boolean;
  hasFreeDelivery: boolean;
  imageUrl: string;
  promotedMenuItems?: MenuItemPromotion[];
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
  price: number;
  promotionPrice?: number | null;
  promotionLabel?: string | null;
  imageUrl: string;
}

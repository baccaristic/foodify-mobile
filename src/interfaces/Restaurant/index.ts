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
}

export interface RestaurantDetailsResponse {
  id: number;
  name: string;
  description: string;
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
}

export interface RestaurantSummary {
  id: number;
  name: string;
  address: string;
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
}

export interface NearbyRestaurantsParams {
  lat: number;
  lng: number;
  radiusKm?: number;
}

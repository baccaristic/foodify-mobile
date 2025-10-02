export interface MenuItemExtra {
  id: number;
  name: string;
  price: number;
  isDefault: boolean;
}

export interface MenuOptionGroup {
  id: number;
  name: string;
  minSelect: number;
  maxSelect: number;
  required: boolean;
  extras: MenuItemExtra[];
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  category: string;
  isPopular: boolean;
  price: number;
  imageUrls: string[];
  optionGroups: MenuOptionGroup[];
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
  menu: MenuItem[];
}

export interface NearbyRestaurantsParams {
  lat: number;
  lng: number;
  radiusKm?: number;
}

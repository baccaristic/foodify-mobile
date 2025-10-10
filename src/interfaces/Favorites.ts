export interface FavoriteRestaurant {
  id: number;
  name: string;
  description: string | null;
  rating: number | null;
  type: string;
  address: string;
  phone: string;
  openingHours: string;
  imageUrl: string;
  closingHours: string;
  latitude: number;
  longitude: number;
}

export interface FavoriteMenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string;
  popular: boolean;
  promotionPrice?: number | null;
  promotionLabel?: string | null;
  promotionActive: boolean;
  restaurantId: number;
  restaurantName: string;
}

export interface ClientFavoritesResponse {
  restaurants: FavoriteRestaurant[];
  menuItems: FavoriteMenuItem[];
}

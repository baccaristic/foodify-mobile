export interface RestaurantRatingRequest {
  thumbsUp: boolean;
  comments?: string | null;
}

export interface RestaurantRatingResponse {
  id: number;
  restaurantId: number;
  orderId: number;
  clientId: number;
  thumbsUp: boolean;
  comments?: string | null;
  restaurantAverageRating: number | null;
  totalRatings: number;
  thumbsUpCount: number;
  thumbsDownCount: number;
  createdAt: string;
  updatedAt: string;
}

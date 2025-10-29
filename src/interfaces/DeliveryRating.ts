export interface DeliveryRatingRequest {
  timing: number;
  foodCondition: number;
  professionalism: number;
  overall: number;
  comments?: string | null;
}

export interface DeliveryRatingSummary {
  timing: number;
  foodCondition: number;
  professionalism: number;
  overall: number;
  comments?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryRatingResponse extends DeliveryRatingSummary {
  orderId: number;
  deliveryId: number;
  driverId: number;
  clientId: number;
  clientName?: string | null;
}

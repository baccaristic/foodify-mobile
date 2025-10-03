export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | string;

export type MonetaryAmount = number | string;

export interface OrderExtraSummary {
  id: number;
  name: string;
  price: MonetaryAmount;
}

export interface OrderedItemSummary {
  menuItemId: number;
  name: string;
  quantity: number;
  unitPrice: MonetaryAmount;
  extrasPrice: MonetaryAmount;
  lineTotal: MonetaryAmount;
  extras?: OrderExtraSummary[];
  specialInstructions?: string | null;
}

export interface LocationDto {
  lat: number;
  lng: number;
}

export interface OrderItemRequest {
  menuItemId: number;
  quantity: number;
  specialInstructions?: string | null;
  extraIds?: number[];
}

export interface OrderRequest {
  deliveryAddress: string;
  items: OrderItemRequest[];
  location: LocationDto;
  paymentMethod: string;
  restaurantId: number;
  userId?: number;
  savedAddressId?: string;
}

export interface RestaurantSummaryResponse {
  id: number;
  name: string;
  imageUrl?: string | null;
}

export interface SavedAddressSummaryDto {
  id?: string;
  label?: string | null;
  formattedAddress?: string;
  type?: string | null;
  [key: string]: unknown;
}

export interface DeliverySummaryResponse {
  address: string;
  location: LocationDto;
  savedAddress?: SavedAddressSummaryDto | null;
}

export interface PaymentSummaryResponse {
  method: string;
  subtotal: MonetaryAmount;
  extrasTotal: MonetaryAmount;
  total: MonetaryAmount;
}

export interface OrderWorkflowStepDto {
  step?: string;
  label?: string;
  description?: string | null;
  status?: string;
  completed?: boolean;
  completedAt?: string | null;
  [key: string]: unknown;
}

export interface CreateOrderResponse {
  orderId: number;
  status: OrderStatus;
  restaurant: RestaurantSummaryResponse;
  delivery: DeliverySummaryResponse;
  payment: PaymentSummaryResponse;
  items: OrderedItemSummary[];
  workflow?: OrderWorkflowStepDto[];
}

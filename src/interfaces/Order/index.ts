export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICK_UP'
  | 'IN_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELED'
  | string;

export type OrderLifecycleAction = 'CREATED' | 'STATUS_CHANGE' | 'ARCHIVED';

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

export interface ClientSummaryDto {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  [key: string]: unknown;
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

export interface RestaurantSummaryDto {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  location?: LocationDto | null;
  [key: string]: unknown;
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

export interface DriverSummaryDto {
  id: number;
  name: string;
  phone?: string | null;
  [key: string]: unknown;
}

export interface DeliverySummaryDto {
  id: number;
  driver?: DriverSummaryDto | null;
  estimatedPickupTime?: number | null;
  estimatedDeliveryTime?: number | null;
  pickupTime?: string | null;
  deliveredTime?: string | null;
  driverLocation?: LocationDto | null;
  [key: string]: unknown;
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

export interface OrderItemDto {
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  extras?: string[] | null;
  specialInstructions?: string | null;
}

export interface OrderStatusHistoryDto {
  action: OrderLifecycleAction;
  previousStatus?: OrderStatus | null;
  newStatus: OrderStatus;
  changedBy?: string | null;
  reason?: string | null;
  metadata?: string | null;
  changedAt: string;
}

export interface OrderNotificationDto {
  orderId: number;
  deliveryAddress?: string | null;
  paymentMethod?: string | null;
  date?: string | null;
  items: OrderItemDto[];
  savedAddress?: SavedAddressSummaryDto | null;
  client?: ClientSummaryDto | null;
  status: OrderStatus;
  deliveryLocation?: LocationDto | null;
  restaurant?: RestaurantSummaryDto | null;
  delivery?: DeliverySummaryDto | null;
  statusHistory?: OrderStatusHistoryDto[];
  [key: string]: unknown;
}

export interface OrderDto {
  id: number;
  restaurantName: string;
  restaurantId: number;
  restaurantAddress?: string | null;
  restaurantLocation?: LocationDto | null;
  restaurantPhone?: string | null;
  clientId: number;
  clientName: string;
  clientPhone?: string | null;
  clientAddress?: string | null;
  clientLocation?: LocationDto | null;
  savedAddress?: SavedAddressSummaryDto | null;
  total: MonetaryAmount;
  status: OrderStatus;
  createdAt: string;
  items: OrderItemDto[];
  driverId?: number | null;
  driverName?: string | null;
  driverPhone?: string | null;
  estimatedPickUpTime?: number | null;
  estimatedDeliveryTime?: number | null;
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

export interface PaginatedOrdersResponse {
  items: OrderDto[];
  page: number;
  pageSize: number;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
}

export interface MyOrdersParams {
  page?: number;
  pageSize?: number;
}

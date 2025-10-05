import type {
  CreateOrderResponse,
  OrderDto,
  OrderNotificationDto,
  OrderStatusHistoryDto,
  OrderExtraSummary,
  OrderedItemSummary,
} from '~/interfaces/Order';

export type OrderTrackingBaseData = Partial<CreateOrderResponse> &
  Partial<OrderNotificationDto> & {
    orderId?: number | string | null;
    statusHistory?: OrderStatusHistoryDto[] | null;
  };

const buildOrderExtras = (extras: string[] | null | undefined): OrderExtraSummary[] | undefined => {
  if (!extras?.length) {
    return undefined;
  }

  return extras.map((name, index) => ({
    id: index,
    name,
    price: 0,
  }));
};

const buildOrderedItems = (items: OrderDto['items']): OrderedItemSummary[] =>
  items.map((item) => ({
    menuItemId: item.menuItemId,
    name: item.menuItemName,
    quantity: item.quantity,
    unitPrice: 0,
    extrasPrice: 0,
    lineTotal: 0,
    extras: buildOrderExtras(item.extras) ?? [],
    specialInstructions: item.specialInstructions ?? null,
  })) as OrderedItemSummary[];

export const convertOrderDtoToTrackingData = (
  order: OrderDto | null | undefined,
): OrderTrackingBaseData | null => {
  if (!order) {
    return null;
  }

  const driver =
    order.driverId != null
      ? {
          id: order.driverId,
          name: order.driverName ?? undefined,
          phone: order.driverPhone ?? undefined,
        }
      : null;

  const deliverySummary: Record<string, unknown> = {
    id: order.id,
    driver,
    estimatedPickupTime: order.estimatedPickUpTime ?? undefined,
    estimatedDeliveryTime: order.estimatedDeliveryTime ?? undefined,
  };

  const base: OrderTrackingBaseData = {
    orderId: order.id,
    status: order.status,
    total: order.total,
    restaurant: {
      id: order.restaurantId,
      name: order.restaurantName,
      address: order.restaurantAddress ?? undefined,
      phone: order.restaurantPhone ?? undefined,
      location: order.restaurantLocation ?? undefined,
    },
    delivery: deliverySummary as any,
    payment: {
      method: undefined,
      subtotal: order.total,
      extrasTotal: 0,
      total: order.total,
    },
    items: buildOrderedItems(order.items),
    deliveryAddress: order.clientAddress ?? undefined,
    deliveryLocation: order.clientLocation ?? undefined,
    savedAddress: order.savedAddress ?? undefined,
    client: {
      id: order.clientId,
      name: order.clientName,
      phone: order.clientPhone ?? undefined,
    },
    statusHistory: [],
  };

  if (order.clientAddress || order.clientLocation) {
    (base as any).delivery = {
      ...(base.delivery as Record<string, unknown>),
      address: order.clientAddress ?? 'Delivery address',
      location:
        order.clientLocation ?? {
          lat: 0,
          lng: 0,
        },
      savedAddress: order.savedAddress ?? undefined,
    };
  }

  if (order.driverId == null) {
    delete (base as any).delivery?.driver;
  }

  return base;
};

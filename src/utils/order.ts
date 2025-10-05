import type {
  CreateOrderResponse,
  OrderNotificationDto,
  OrderStatusHistoryDto,
} from '~/interfaces/Order';

export type OrderLike = Partial<CreateOrderResponse> &
  Partial<OrderNotificationDto> & {
    orderId?: number | string | null;
    statusHistory?: OrderStatusHistoryDto[] | null | undefined;
    [key: string]: unknown;
  };

export const formatOrderStatusLabel = (status: string | null | undefined) => {
  if (!status) {
    return null;
  }

  return status
    .toString()
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

export const mergeOrderLikeData = <T extends OrderLike>(
  baseOrder: T | null | undefined,
  update: Partial<T> | null | undefined,
): T | null => {
  if (!baseOrder && !update) {
    return null;
  }

  const base = (baseOrder ?? {}) as OrderLike;
  const overlay = (update ?? {}) as OrderLike;

  const mergedRestaurant =
    base.restaurant || overlay.restaurant
      ? {
          ...((base.restaurant as Record<string, unknown>) ?? {}),
          ...((overlay.restaurant as Record<string, unknown>) ?? {}),
        }
      : undefined;

  const mergedDeliveryBase: Record<string, unknown> = {
    ...((base.delivery as Record<string, unknown>) ?? {}),
    ...((overlay.delivery as Record<string, unknown>) ?? {}),
  };

  const baseDeliveryDriver = (base as any)?.delivery?.driver;
  const overlayDeliveryDriver = (overlay as any)?.delivery?.driver;

  if (baseDeliveryDriver != null || overlayDeliveryDriver != null) {
    mergedDeliveryBase.driver = {
      ...((baseDeliveryDriver as Record<string, unknown>) ?? {}),
      ...((overlayDeliveryDriver as Record<string, unknown>) ?? {}),
    };
  }

  const mergedPayment =
    base.payment || overlay.payment
      ? {
          ...((base.payment as Record<string, unknown>) ?? {}),
          ...((overlay.payment as Record<string, unknown>) ?? {}),
        }
      : undefined;

  const merged: OrderLike = {
    ...base,
    ...overlay,
    ...(mergedRestaurant ? { restaurant: mergedRestaurant } : {}),
    ...(Object.keys(mergedDeliveryBase).length ? { delivery: mergedDeliveryBase } : {}),
    ...(mergedPayment ? { payment: mergedPayment } : {}),
    items: overlay.items ?? base.items,
    workflow: overlay.workflow ?? base.workflow,
    statusHistory: overlay.statusHistory ?? base.statusHistory,
    status: overlay.status ?? base.status,
    orderId: overlay.orderId ?? base.orderId,
  };

  if (merged.orderId == null && baseOrder?.orderId != null) {
    merged.orderId = baseOrder.orderId;
  }

  return merged as T;
};

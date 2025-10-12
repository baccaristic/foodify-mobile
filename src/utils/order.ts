import type {
  CreateOrderResponse,
  MonetaryAmount,
  OrderExtraSummary,
  OrderItemDto,
  OrderedItemSummary,
  OrderNotificationDto,
  OrderStatusHistoryDto,
  RestaurantSummaryDto,
} from '~/interfaces/Order';

export type OrderLike = Partial<CreateOrderResponse> &
  Partial<OrderNotificationDto> & {
    orderId?: number | string | null;
    statusHistory?: OrderStatusHistoryDto[] | null | undefined;
    [key: string]: unknown;
  };

const coerceRestaurantSummary = (
  restaurant: CreateOrderResponse['restaurant'] | OrderNotificationDto['restaurant'] | null | undefined,
): RestaurantSummaryDto | undefined => {
  if (!restaurant) {
    return undefined;
  }

  const source = restaurant as Record<string, unknown>;

  const idCandidate = source.id;
  const resolvedId = typeof idCandidate === 'number' ? idCandidate : Number(idCandidate);

  return {
    id: Number.isFinite(resolvedId) ? Number(resolvedId) : 0,
    name: typeof source.name === 'string' ? source.name : 'Restaurant',
    imageUrl: typeof source.imageUrl === 'string' ? source.imageUrl : undefined,
    address: typeof source.address === 'string' ? source.address : undefined,
    phone: typeof source.phone === 'string' ? source.phone : undefined,
    location: source.location as RestaurantSummaryDto['location'],
  } satisfies RestaurantSummaryDto;
};

const parseMonetaryAmount = (value: MonetaryAmount | null | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = Number(value.replace(',', '.'));
    if (Number.isFinite(normalized)) {
      return normalized;
    }
  }

  return 0;
};

const cloneExtras = (extras?: OrderExtraSummary[] | null) =>
  extras?.map((extra) => ({
    id: extra.id,
    name: extra.name,
    price: extra.price,
  }));

const sumExtrasPrice = (extras?: OrderExtraSummary[] | null) =>
  extras?.reduce((sum, extra) => sum + parseMonetaryAmount(extra.price), 0) ?? 0;

const isOrderedItemSummary = (candidate: unknown): candidate is OrderedItemSummary =>
  Boolean(
    candidate &&
      typeof candidate === 'object' &&
      ('lineTotal' in (candidate as Record<string, unknown>) ||
        'unitPrice' in (candidate as Record<string, unknown>) ||
        'extrasPrice' in (candidate as Record<string, unknown>)),
  );

const isOrderItemDto = (candidate: unknown): candidate is OrderItemDto =>
  Boolean(
    candidate &&
      typeof candidate === 'object' &&
      'menuItemName' in (candidate as Record<string, unknown>),
  );

const normalizeItemToSummary = (
  input: unknown,
  fallback: OrderedItemSummary | undefined,
  index: number,
): OrderedItemSummary | null => {
  const fallbackExtras = cloneExtras(fallback?.extras);

  if (isOrderedItemSummary(input)) {
    const extras = Array.isArray(input.extras)
      ? input.extras.map((extra, extraIndex) => ({
          id:
            (extra as OrderExtraSummary | null | undefined)?.id ??
            fallbackExtras?.[extraIndex]?.id ??
            extraIndex,
          name:
            (extra as OrderExtraSummary | null | undefined)?.name ??
            fallbackExtras?.[extraIndex]?.name ??
            '',
          price:
            (extra as OrderExtraSummary | null | undefined)?.price ??
            fallbackExtras?.[extraIndex]?.price ??
            0,
        }))
      : fallbackExtras ?? undefined;

    return {
      menuItemId: input.menuItemId ?? fallback?.menuItemId ?? index,
      name:
        input.name ??
        (input as OrderItemDto | null | undefined)?.menuItemName ??
        fallback?.name ??
        'Menu item',
      quantity: input.quantity ?? fallback?.quantity ?? 1,
      unitPrice: input.unitPrice ?? fallback?.unitPrice ?? 0,
      extrasPrice: input.extrasPrice ?? fallback?.extrasPrice ?? 0,
      lineTotal: input.lineTotal ?? fallback?.lineTotal ?? 0,
      extras: extras && extras.length ? extras : undefined,
      specialInstructions:
        input.specialInstructions ?? fallback?.specialInstructions ?? null,
    } satisfies OrderedItemSummary;
  }

  if (isOrderItemDto(input)) {
    const extrasNames = Array.isArray(input.extras)
      ? input.extras.filter(
          (extra): extra is string => typeof extra === 'string' && extra.trim().length > 0,
        )
      : [];

    const extras = extrasNames.length
      ? extrasNames.map((name, extraIndex) => {
          const fallbackExtra = fallbackExtras?.find((candidate) => candidate.name === name);
          const indexedFallback = fallbackExtras?.[extraIndex];
          const resolvedFallback = fallbackExtra ?? indexedFallback ?? null;

          return {
            id: resolvedFallback?.id ?? extraIndex,
            name,
            price: resolvedFallback?.price ?? 0,
          } satisfies OrderExtraSummary;
        })
      : fallbackExtras ?? undefined;

    const quantity = input.quantity ?? fallback?.quantity ?? 1;
    const unitPrice = fallback?.unitPrice ?? 0;
    const derivedExtrasPrice = extras && extras.length ? sumExtrasPrice(extras) : 0;
    const extrasPrice: MonetaryAmount =
      fallback?.extrasPrice ??
      (derivedExtrasPrice > 0 ? Number(derivedExtrasPrice.toFixed(3)) : 0);

    const fallbackLineTotal = fallback?.lineTotal;
    const parsedFallbackLineTotal = parseMonetaryAmount(fallbackLineTotal);
    const computedLineTotal = (() => {
      if (parsedFallbackLineTotal > 0) {
        return fallbackLineTotal ?? parsedFallbackLineTotal;
      }

      const parsedUnit = parseMonetaryAmount(unitPrice);
      const parsedExtras = parseMonetaryAmount(extrasPrice);
      const subtotal = parsedUnit * quantity + parsedExtras;

      if (!Number.isFinite(subtotal) || subtotal <= 0) {
        return undefined;
      }

      return Number(subtotal.toFixed(3));
    })();

    return {
      menuItemId: input.menuItemId ?? fallback?.menuItemId ?? index,
      name: input.menuItemName ?? fallback?.name ?? 'Menu item',
      quantity,
      unitPrice,
      extrasPrice,
      lineTotal: computedLineTotal ?? 0,
      extras: extras && extras.length ? extras : undefined,
      specialInstructions: input.specialInstructions ?? fallback?.specialInstructions ?? null,
    } satisfies OrderedItemSummary;
  }

  if (fallback) {
    return {
      ...fallback,
      extras: fallbackExtras ?? fallback.extras,
    } satisfies OrderedItemSummary;
  }

  return null;
};

const mergeItems = (
  baseItems: unknown[] | null | undefined,
  overlayItems: unknown[] | null | undefined,
): OrderedItemSummary[] | undefined => {
  const baseSummaries = Array.isArray(baseItems)
    ? baseItems
        .map((item, index) => normalizeItemToSummary(item, undefined, index))
        .filter((item): item is OrderedItemSummary => Boolean(item))
    : undefined;

  const overlaySummariesRaw = Array.isArray(overlayItems)
    ? overlayItems.map((item, index) => normalizeItemToSummary(item, baseSummaries?.[index], index))
    : undefined;

  const overlaySummaries = overlaySummariesRaw?.filter(
    (item): item is OrderedItemSummary => Boolean(item),
  );

  if (overlaySummaries?.length) {
    if (baseSummaries?.length) {
      const merged = overlaySummaries.map((item, index) => {
        const baseItem = baseSummaries[index];

        if (!baseItem) {
          return item;
        }

        return {
          ...baseItem,
          ...item,
          extras: item.extras ?? baseItem.extras,
          unitPrice: item.unitPrice ?? baseItem.unitPrice,
          extrasPrice: item.extrasPrice ?? baseItem.extrasPrice,
          lineTotal: item.lineTotal ?? baseItem.lineTotal,
          specialInstructions: item.specialInstructions ?? baseItem.specialInstructions ?? null,
        } satisfies OrderedItemSummary;
      });

      if (baseSummaries.length > merged.length) {
        for (let index = merged.length; index < baseSummaries.length; index += 1) {
          const baseItem = baseSummaries[index];
          if (baseItem) {
            merged.push({
              ...baseItem,
              extras: cloneExtras(baseItem.extras) ?? baseItem.extras,
            });
          }
        }
      }

      return merged;
    }

    return overlaySummaries;
  }

  return baseSummaries;
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

  const mergedItems = mergeItems(
    base.items as unknown[] | null | undefined,
    overlay.items as unknown[] | null | undefined,
  );

  const merged: OrderLike = {
    ...base,
    ...overlay,
    ...(mergedRestaurant ? { restaurant: mergedRestaurant } : {}),
    ...(Object.keys(mergedDeliveryBase).length ? { delivery: mergedDeliveryBase } : {}),
    ...(mergedPayment ? { payment: mergedPayment } : {}),
    items: (mergedItems ?? overlay.items ?? base.items) as OrderLike['items'],
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

const mapOrderedItemSummaryToNotification = (item: OrderedItemSummary | null | undefined) => {
  if (!item) {
    return null;
  }

  const extras = Array.isArray(item.extras)
    ? item.extras
        .map((extra) => (typeof extra?.name === 'string' ? extra.name : null))
        .filter((name): name is string => Boolean(name && name.trim().length))
    : undefined;

  return {
    menuItemId: item.menuItemId,
    menuItemName: item.name,
    quantity: item.quantity,
    extras,
    specialInstructions: item.specialInstructions ?? null,
  } satisfies OrderItemDto;
};

export const convertCreateOrderResponseToTrackingOrder = (
  response: CreateOrderResponse | null | undefined,
): OrderLike | null => {
  if (!response) {
    return null;
  }

  const itemSummaries = Array.isArray(response.items)
    ? response.items.map((item) => ({ ...item }))
    : undefined;

  const notificationItems = itemSummaries
    ?.map(mapOrderedItemSummaryToNotification)
    .filter((item): item is OrderItemDto => Boolean(item));

  const deliveryAddress = response.delivery?.address ?? undefined;
  const deliveryLocation = response.delivery?.location ?? undefined;
  const savedAddress = response.delivery?.savedAddress ?? undefined;

  return {
    ...response,
    orderId: response.orderId,
    status: response.status,
    workflow: response.workflow,
    deliveryAddress,
    deliveryLocation,
    savedAddress,
    paymentMethod: response.payment?.method ?? undefined,
    restaurant: coerceRestaurantSummary(response.restaurant),
    delivery: response.delivery
      ? ({
          ...(response.delivery as Record<string, unknown>),
          address: response.delivery.address,
          location: response.delivery.location,
          savedAddress: response.delivery.savedAddress,
        } as OrderLike['delivery'])
      : undefined,
    items: notificationItems ?? [],
    itemSummaries,
  } satisfies OrderLike;
};

export const isCreateOrderResponsePayload = (
  candidate: unknown,
): candidate is CreateOrderResponse => {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }

  const record = candidate as Record<string, unknown>;

  return (
    Array.isArray(record.items) &&
    'payment' in record &&
    'delivery' in record &&
    'orderId' in record
  );
};

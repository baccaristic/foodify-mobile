import client from './client';
import type {
  CreateOrderResponse,
  MyOrdersParams,
  OrderDto,
  OrderNotificationDto,
  OrderRequest,
  PaginatedOrdersResponse,
} from '~/interfaces/Order';

export const createOrder = async (payload: OrderRequest) => {
  const { data } = await client.post<CreateOrderResponse>('/orders/create', payload);
  return data;
};

export const getMyOrders = async ({
  page = 1,
  pageSize = 10,
}: MyOrdersParams = {}): Promise<PaginatedOrdersResponse> => {
  const { data } = await client.get<PaginatedOrdersResponse | OrderDto[]>(
    '/client/my-orders',
    {
      params: { page, pageSize },
    },
  );

  if (Array.isArray(data)) {
    return {
      items: data,
      page,
      pageSize,
      totalItems: data.length,
      totalPages: data.length < pageSize ? page : undefined,
    };
  }

  const normalized = data ?? ({} as Partial<PaginatedOrdersResponse>);

  const items = Array.isArray(normalized.items) ? normalized.items : [];
  const resolvedPage = typeof normalized.page === 'number' ? normalized.page : page;
  const resolvedPageSize =
    typeof normalized.pageSize === 'number' ? normalized.pageSize : pageSize;
  const totalItems =
    typeof normalized.totalItems === 'number' ? normalized.totalItems : undefined;
  const totalPages =
    typeof normalized.totalPages === 'number' ? normalized.totalPages : undefined;
  const hasNext = typeof normalized.hasNext === 'boolean' ? normalized.hasNext : undefined;

  return {
    items,
    page: resolvedPage,
    pageSize: resolvedPageSize,
    totalItems,
    totalPages,
    hasNext,
  };
};

export const getOngoingOrder = async () => {
  const response = await client.get<OrderNotificationDto | null>('/orders/ongoing');
  if (response.status === 204) {
    return null;
  }

  const payload = response.data;
  if (payload == null || payload === '') {
    return null;
  }

  return payload;
};

export type { CreateOrderResponse, OrderRequest, OrderDto };

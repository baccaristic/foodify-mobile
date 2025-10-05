import client from './client';
import type { CreateOrderResponse, OrderDto, OrderNotificationDto, OrderRequest } from '~/interfaces/Order';

export const createOrder = async (payload: OrderRequest) => {
  const { data } = await client.post<CreateOrderResponse>('/orders/create', payload);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await client.get<OrderDto[]>('/client/my-orders');
  return data ?? [];
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

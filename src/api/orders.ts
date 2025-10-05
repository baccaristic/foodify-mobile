import client from './client';
import type { CreateOrderResponse, OrderDto, OrderRequest } from '~/interfaces/Order';

export const createOrder = async (payload: OrderRequest) => {
  const { data } = await client.post<CreateOrderResponse>('/orders/create', payload);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await client.get<OrderDto[]>('/client/my-orders');
  return data ?? [];
};

export const getOngoingOrder = async () => {
  const response = await client.get<OrderDto>('/orders/ongoing', {
    validateStatus: (status) => (status >= 200 && status < 300) || status === 204,
  });

  if (response.status === 204) {
    return null;
  }

  return response.data ?? null;
};

export type { CreateOrderResponse, OrderRequest, OrderDto };

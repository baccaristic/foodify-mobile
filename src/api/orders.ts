import client from './client';
import type { CreateOrderResponse, OrderDto, OrderRequest } from '~/interfaces/Order';

export const createOrder = async (payload: OrderRequest) => {
  const { data } = await client.post<CreateOrderResponse>('/api/orders/create', payload);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await client.get<OrderDto[]>('/client/my-orders');
  return data ?? [];
};

export type { CreateOrderResponse, OrderRequest, OrderDto };

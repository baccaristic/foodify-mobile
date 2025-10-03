import client from './client';
import type { CreateOrderResponse, OrderRequest } from '~/interfaces/Order';

export const createOrder = async (payload: OrderRequest) => {
  const { data } = await client.post<CreateOrderResponse>('/orders/create', payload);
  return data;
};

export type { CreateOrderResponse, OrderRequest };

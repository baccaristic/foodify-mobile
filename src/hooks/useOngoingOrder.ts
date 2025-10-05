import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getOngoingOrder } from '~/api/orders';
import useAuth from './useAuth';
import { useWebSocketContext } from '~/context/WebSocketContext';
import type { OrderDto } from '~/interfaces/Order';

export const ONGOING_ORDER_QUERY_KEY = ['orders', 'ongoing'] as const;

const useOngoingOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { latestOrderUpdate } = useWebSocketContext();

  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: ONGOING_ORDER_QUERY_KEY });
    }
  }, [queryClient, user]);

  useEffect(() => {
    if (!latestOrderUpdate?.orderId) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ONGOING_ORDER_QUERY_KEY });
  }, [latestOrderUpdate?.orderId, queryClient]);

  return useQuery<OrderDto | null>({
    queryKey: ONGOING_ORDER_QUERY_KEY,
    queryFn: getOngoingOrder,
    enabled: Boolean(user),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    refetchInterval: (data) => (data ? 60_000 : false),
  });
};

export default useOngoingOrder;

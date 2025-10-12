import { useOngoingOrderContext } from '~/context/OngoingOrderContext';

export type { OngoingOrderData } from '~/context/OngoingOrderContext';

export default function useOngoingOrder() {
  const context = useOngoingOrderContext();
  return context;
}

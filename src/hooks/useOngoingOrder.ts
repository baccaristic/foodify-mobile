import { useOngoingOrderContext } from '~/context/OngoingOrderContext';

export type { OngoingOrderData } from '~/context/OngoingOrderContext';

export default function useOngoingOrder() {
  return useOngoingOrderContext();
}

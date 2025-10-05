import { create } from 'zustand';

interface OngoingOrderBannerState {
  isCollapsed: boolean;
  hasOngoingOrder: boolean;
  currentOrderId: string | number | null;
  lastOrderId: string | number | null;
  setCollapsed: (value: boolean) => void;
  setOrderPresence: (payload: { hasOrder: boolean; orderId: string | number | null }) => void;
  setLastOrderId: (orderId: string | number | null) => void;
  reset: () => void;
}

const initialState = {
  isCollapsed: false,
  hasOngoingOrder: false,
  currentOrderId: null as string | number | null,
  lastOrderId: null as string | number | null,
};

const useOngoingOrderBannerStore = create<OngoingOrderBannerState>((set) => ({
  ...initialState,
  setCollapsed: (value) => set({ isCollapsed: value }),
  setOrderPresence: ({ hasOrder, orderId }) =>
    set({
      hasOngoingOrder: hasOrder,
      currentOrderId: hasOrder ? orderId : null,
    }),
  setLastOrderId: (orderId) => set({ lastOrderId: orderId }),
  reset: () => set({ ...initialState }),
}));

export default useOngoingOrderBannerStore;

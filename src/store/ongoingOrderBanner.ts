import { create } from 'zustand';

interface OngoingOrderBannerState {
  isCollapsed: boolean;
  lastOrderId: string | number | null;
  setCollapsed: (value: boolean) => void;
  setLastOrderId: (orderId: string | number | null) => void;
  reset: () => void;
}

const useOngoingOrderBannerStore = create<OngoingOrderBannerState>((set) => ({
  isCollapsed: false,
  lastOrderId: null,
  setCollapsed: (value) => set({ isCollapsed: value }),
  setLastOrderId: (orderId) => set({ lastOrderId: orderId }),
  reset: () => set({ isCollapsed: false, lastOrderId: null }),
}));

export default useOngoingOrderBannerStore;

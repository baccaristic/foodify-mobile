import { create } from 'zustand';

interface OngoingOrderBannerState {
  isCollapsed: boolean;
  hasOngoingOrder: boolean;
  currentOrderId: string | number | null;
  lastOrderId: string | number | null;
  bannerHeight: number;
  setCollapsed: (value: boolean) => void;
  setOrderPresence: (payload: { hasOrder: boolean; orderId: string | number | null }) => void;
  setLastOrderId: (orderId: string | number | null) => void;
  setBannerHeight: (height: number) => void;
  reset: () => void;
}

const initialState = {
  isCollapsed: false,
  hasOngoingOrder: false,
  currentOrderId: null as string | number | null,
  lastOrderId: null as string | number | null,
  bannerHeight: 0,
};

const useOngoingOrderBannerStore = create<OngoingOrderBannerState>((set) => ({
  ...initialState,
  setCollapsed: (value) =>
    set((state) => {
      if (state.isCollapsed === value) {
        return state;
      }
      return { ...state, isCollapsed: value };
    }),
  setOrderPresence: ({ hasOrder, orderId }) =>
    set((state) => {
      const nextHasOrder = hasOrder;
      const nextOrderId = hasOrder ? orderId : null;

      if (state.hasOngoingOrder === nextHasOrder && state.currentOrderId === nextOrderId) {
        return state;
      }

      return {
        ...state,
        hasOngoingOrder: nextHasOrder,
        currentOrderId: nextOrderId,
      };
    }),
  setLastOrderId: (orderId) =>
    set((state) => {
      if (state.lastOrderId === orderId) {
        return state;
      }
      return { ...state, lastOrderId: orderId };
    }),
  setBannerHeight: (height) =>
    set((state) => {
      if (!Number.isFinite(height)) {
        return state;
      }

      const normalizedHeight = height <= 0 ? 0 : height;

      if (Math.abs(state.bannerHeight - normalizedHeight) <= 1) {
        return state;
      }

      return { ...state, bannerHeight: normalizedHeight };
    }),
  reset: () =>
    set((state) => {
      if (
        state.isCollapsed === initialState.isCollapsed &&
        state.hasOngoingOrder === initialState.hasOngoingOrder &&
        state.currentOrderId === initialState.currentOrderId &&
        state.lastOrderId === initialState.lastOrderId &&
        state.bannerHeight === initialState.bannerHeight
      ) {
        return state;
      }

      return { ...initialState };
    }),
}));

export default useOngoingOrderBannerStore;

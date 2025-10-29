import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { DeliveryRatingSummary } from '~/interfaces/DeliveryRating';

interface DeliveryRatingOverlayMetadata {
  driverName?: string | null;
  restaurantName?: string | null;
}

interface DeliveryRatingOverlayState {
  isVisible: boolean;
  orderId: number | null;
  rating: DeliveryRatingSummary | null;
  metadata: DeliveryRatingOverlayMetadata | null;
}

interface OpenDeliveryRatingOverlayOptions extends DeliveryRatingOverlayMetadata {
  orderId: number | string;
  rating?: DeliveryRatingSummary | null;
}

interface DeliveryRatingOverlayContextValue {
  state: DeliveryRatingOverlayState;
  open: (options: OpenDeliveryRatingOverlayOptions) => void;
  close: () => void;
  setRating: (rating: DeliveryRatingSummary | null) => void;
}

const defaultState: DeliveryRatingOverlayState = {
  isVisible: false,
  orderId: null,
  rating: null,
  metadata: null,
};

const DeliveryRatingOverlayContext = createContext<DeliveryRatingOverlayContextValue | undefined>(
  undefined,
);

export const DeliveryRatingOverlayProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DeliveryRatingOverlayState>(defaultState);

  const open = useCallback((options: OpenDeliveryRatingOverlayOptions) => {
    const parsedOrderId = Number(options.orderId);

    if (!Number.isFinite(parsedOrderId) || parsedOrderId <= 0) {
      console.warn('DeliveryRatingOverlay: invalid order id provided to open overlay.');
      return;
    }

    setState({
      isVisible: true,
      orderId: parsedOrderId,
      rating: options.rating ?? null,
      metadata: {
        driverName: options.driverName ?? null,
        restaurantName: options.restaurantName ?? null,
      },
    });
  }, []);

  const close = useCallback(() => {
    setState(defaultState);
  }, []);

  const setRating = useCallback((rating: DeliveryRatingSummary | null) => {
    setState((previous) => ({
      ...previous,
      rating,
    }));
  }, []);

  const value = useMemo<DeliveryRatingOverlayContextValue>(
    () => ({
      state,
      open,
      close,
      setRating,
    }),
    [close, open, setRating, state],
  );

  return (
    <DeliveryRatingOverlayContext.Provider value={value}>
      {children}
    </DeliveryRatingOverlayContext.Provider>
  );
};

export const useDeliveryRatingOverlay = () => {
  const context = useContext(DeliveryRatingOverlayContext);
  if (!context) {
    throw new Error('useDeliveryRatingOverlay must be used within a DeliveryRatingOverlayProvider');
  }
  return context;
};

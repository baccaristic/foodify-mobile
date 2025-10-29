import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { RestaurantRatingResponse } from '~/interfaces/RestaurantRating';

interface RestaurantRatingOverlayMetadata {
  restaurantName?: string | null;
}

interface RestaurantRatingOverlayState {
  isVisible: boolean;
  orderId: number | null;
  rating: RestaurantRatingResponse | null;
  metadata: RestaurantRatingOverlayMetadata | null;
}

interface OpenRestaurantRatingOverlayOptions extends RestaurantRatingOverlayMetadata {
  orderId: number | string;
  rating?: RestaurantRatingResponse | null;
}

interface RestaurantRatingOverlayContextValue {
  state: RestaurantRatingOverlayState;
  open: (options: OpenRestaurantRatingOverlayOptions) => void;
  close: () => void;
  setRating: (rating: RestaurantRatingResponse | null) => void;
}

const defaultState: RestaurantRatingOverlayState = {
  isVisible: false,
  orderId: null,
  rating: null,
  metadata: null,
};

const RestaurantRatingOverlayContext = createContext<RestaurantRatingOverlayContextValue | undefined>(
  undefined,
);

export const RestaurantRatingOverlayProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<RestaurantRatingOverlayState>(defaultState);

  const open = useCallback((options: OpenRestaurantRatingOverlayOptions) => {
    const parsedOrderId = Number(options.orderId);

    if (!Number.isFinite(parsedOrderId) || parsedOrderId <= 0) {
      console.warn('RestaurantRatingOverlay: invalid order id provided to open overlay.');
      return;
    }

    setState({
      isVisible: true,
      orderId: parsedOrderId,
      rating: options.rating ?? null,
      metadata: { restaurantName: options.restaurantName ?? null },
    });
  }, []);

  const close = useCallback(() => {
    setState(defaultState);
  }, []);

  const setRating = useCallback((rating: RestaurantRatingResponse | null) => {
    setState((previous) => ({
      ...previous,
      rating,
    }));
  }, []);

  const value = useMemo<RestaurantRatingOverlayContextValue>(
    () => ({
      state,
      open,
      close,
      setRating,
    }),
    [close, open, setRating, state],
  );

  return (
    <RestaurantRatingOverlayContext.Provider value={value}>
      {children}
    </RestaurantRatingOverlayContext.Provider>
  );
};

export const useRestaurantRatingOverlay = () => {
  const context = useContext(RestaurantRatingOverlayContext);
  if (!context) {
    throw new Error('useRestaurantRatingOverlay must be used within a RestaurantRatingOverlayProvider');
  }
  return context;
};

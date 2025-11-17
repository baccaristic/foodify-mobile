import { useEffect, useCallback, useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import { useOngoingOrderContext } from '~/context/OngoingOrderContext';
import {
  liveActivityService,
  createLiveActivityAttributes,
  createLiveActivityContentState,
} from '~/services/liveActivity';
import { formatOrderStatusLabel } from '~/utils/order';
import { useCurrencyFormatter } from '~/localization/hooks';
import type { MonetaryAmount } from '~/interfaces/Order';

/**
 * Terminal order statuses that should end the Live Activity
 */
const TERMINAL_STATUSES = new Set(['DELIVERED', 'CANCELED', 'REJECTED']);

/**
 * Extract numeric amount from monetary value
 */
const extractNumericAmount = (value: MonetaryAmount | null | undefined): number | null => {
  if (value == null) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

/**
 * Custom hook to manage iOS Live Activities for ongoing orders
 */
export function useLiveActivity() {
  const { order } = useOngoingOrderContext();
  const formatCurrency = useCurrencyFormatter();
  const previousStatusRef = useRef<string | null>(null);
  const previousOrderIdRef = useRef<string | number | null>(null);
  const isInitializedRef = useRef(false);

  // Resolve the latest status from order (use direct status, not statusHistory)
  const currentStatus = useMemo(() => {
    if (!order) {
      return null;
    }

    return order.status ? String(order.status).toUpperCase() : null;
  }, [order]);

  // Format order total
  const orderTotal = useMemo(() => {
    if (!order) {
      return undefined;
    }

    const paymentRecord = (order.payment ?? null) as any;
    const candidates: (MonetaryAmount | null | undefined)[] = [
      paymentRecord?.total,
      paymentRecord?.itemsTotal,
      paymentRecord?.subtotal,
      (order as any)?.total,
    ];

    for (const candidate of candidates) {
      const amount = extractNumericAmount(candidate);
      if (amount !== null) {
        return formatCurrency(amount);
      }
    }

    return undefined;
  }, [order, formatCurrency]);

  // Get formatted status label
  const getStatusLabel = useCallback((status: string | null): string => {
    if (!status) {
      return 'Order in Progress';
    }

    return formatOrderStatusLabel(status) ?? status.replace(/_/g, ' ');
  }, []);

  // Start Live Activity
  const startLiveActivity = useCallback(async () => {
    if (Platform.OS !== 'ios' || !order || !order.orderId) {
      return;
    }

    const statusLabel = getStatusLabel(currentStatus);
    const attributes = createLiveActivityAttributes(order, statusLabel, orderTotal);

    if (!attributes) {
      return;
    }

    const contentState = createLiveActivityContentState(order, statusLabel);
    await liveActivityService.startActivity(attributes, contentState);
  }, [order, currentStatus, orderTotal, getStatusLabel]);

  // Update Live Activity
  const updateLiveActivity = useCallback(async () => {
    if (Platform.OS !== 'ios' || !order || !liveActivityService.hasActiveActivity()) {
      return;
    }

    const statusLabel = getStatusLabel(currentStatus);
    const contentState = createLiveActivityContentState(order, statusLabel);
    await liveActivityService.updateActivity(contentState);
  }, [order, currentStatus, getStatusLabel]);

  // End Live Activity
  const endLiveActivity = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      return;
    }

    await liveActivityService.endActivity();
  }, []);

  // Handle order changes
  useEffect(() => {
    // Skip if not iOS
    if (Platform.OS !== 'ios') {
      return;
    }

    // If there's no order, end any active Live Activity
    if (!order || !order.orderId) {
      if (liveActivityService.hasActiveActivity()) {
        (async () => {
          await liveActivityService.endActivity();
          isInitializedRef.current = false;
          previousStatusRef.current = null;
          previousOrderIdRef.current = null;
        })();
      }
      return;
    }

    const currentOrderId = order.orderId;
    const previousOrderId = previousOrderIdRef.current;

    // Check if this is a new order
    const isNewOrder =
      !isInitializedRef.current ||
      (previousOrderId !== null && String(previousOrderId) !== String(currentOrderId));

    // Check if status changed
    const hasStatusChanged =
      currentStatus &&
      previousStatusRef.current &&
      currentStatus !== previousStatusRef.current;

    // Check if status is terminal
    const isTerminalStatus = currentStatus && TERMINAL_STATUSES.has(currentStatus);

    // Handle different scenarios
    if (isNewOrder) {
      // Start a new Live Activity for the new order
      const statusLabel = getStatusLabel(currentStatus);
      const attributes = createLiveActivityAttributes(order, statusLabel, orderTotal);
      
      if (attributes) {
        const contentState = createLiveActivityContentState(order, statusLabel);
        (async () => {
          await liveActivityService.startActivity(attributes, contentState);
        })();
      }
      
      isInitializedRef.current = true;
      previousOrderIdRef.current = currentOrderId;
      previousStatusRef.current = currentStatus;
    } else if (isTerminalStatus) {
      // End Live Activity when order reaches terminal status
      if (liveActivityService.hasActiveActivity()) {
        // Wait a moment before ending to show the final status
        setTimeout(() => {
          liveActivityService.endActivity();
          isInitializedRef.current = false;
          previousStatusRef.current = null;
        }, 3000);
      }
    } else if (hasStatusChanged) {
      // Update Live Activity when status changes
      const statusLabel = getStatusLabel(currentStatus);
      const contentState = createLiveActivityContentState(order, statusLabel);
      
      if (liveActivityService.hasActiveActivity()) {
        (async () => {
          await liveActivityService.updateActivity(contentState);
        })();
      }
      
      previousStatusRef.current = currentStatus;
    } else if (!liveActivityService.hasActiveActivity() && !isTerminalStatus) {
      // If there's no active activity but there should be one, start it
      const statusLabel = getStatusLabel(currentStatus);
      const attributes = createLiveActivityAttributes(order, statusLabel, orderTotal);
      
      if (attributes) {
        const contentState = createLiveActivityContentState(order, statusLabel);
        (async () => {
          await liveActivityService.startActivity(attributes, contentState);
        })();
      }
      
      isInitializedRef.current = true;
      previousOrderIdRef.current = currentOrderId;
      previousStatusRef.current = currentStatus;
    }
  }, [order, currentStatus, orderTotal, getStatusLabel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't automatically end Live Activity on unmount
      // as we want it to persist even when the app is closed
    };
  }, []);

  return {
    hasActiveActivity: liveActivityService.hasActiveActivity(),
    startLiveActivity,
    updateLiveActivity,
    endLiveActivity,
  };
}

import { Platform, NativeModules } from 'react-native';
import type { OngoingOrderData } from '~/context/OngoingOrderContext';
import type { OrderStatus } from '~/interfaces/Order';

/**
 * Live Activity attributes for iOS order tracking
 */
export interface OrderLiveActivityAttributes {
  orderId: string;
  restaurantName: string;
  restaurantImageUrl?: string;
  status: OrderStatus;
  statusLabel: string;
  estimatedReadyAt?: string;
  courierName?: string;
  courierRating?: string;
  orderTotal?: string;
  itemsCount: number;
}

/**
 * Content state for Live Activity updates
 */
export interface OrderLiveActivityContentState {
  status: OrderStatus;
  statusLabel: string;
  estimatedReadyAt?: string;
  courierName?: string;
  courierRating?: string;
  lastUpdatedAt: string;
}

/**
 * Native module interface for Live Activities
 * This will be implemented as a native module in the iOS app
 */
interface LiveActivityNativeModule {
  areActivitiesEnabled(): Promise<boolean>;
  startActivity(
    activityType: string,
    attributes: Record<string, any>,
    contentState: Record<string, any>,
  ): Promise<string>;
  updateActivity(activityId: string, contentState: Record<string, any>): Promise<void>;
  endActivity(activityId: string): Promise<void>;
}

/**
 * Mock implementation for development and non-iOS platforms
 */
const MockLiveActivityModule: LiveActivityNativeModule = {
  async areActivitiesEnabled(): Promise<boolean> {
    console.log('[Mock Live Activity] Checking if activities are enabled');
    return false;
  },
  async startActivity(
    activityType: string,
    attributes: Record<string, any>,
    contentState: Record<string, any>,
  ): Promise<string> {
    console.log('[Mock Live Activity] Starting activity:', {
      activityType,
      attributes,
      contentState,
    });
    return `mock-activity-${Date.now()}`;
  },
  async updateActivity(activityId: string, contentState: Record<string, any>): Promise<void> {
    console.log('[Mock Live Activity] Updating activity:', activityId, contentState);
  },
  async endActivity(activityId: string): Promise<void> {
    console.log('[Mock Live Activity] Ending activity:', activityId);
  },
};

/**
 * Get the Live Activity native module or mock
 */
function getLiveActivityModule(): LiveActivityNativeModule {
  if (Platform.OS === 'ios' && NativeModules.LiveActivityModule) {
    return NativeModules.LiveActivityModule as LiveActivityNativeModule;
  }
  return MockLiveActivityModule;
}

/**
 * Live Activity service for managing iOS Live Activities
 */
class LiveActivityService {
  private currentActivityId: string | null = null;
  private isSupported: boolean = false;
  private module: LiveActivityNativeModule;

  constructor() {
    this.module = getLiveActivityModule();
    this.checkSupport();
  }

  /**
   * Check if Live Activities are supported on the current platform
   */
  private async checkSupport(): Promise<void> {
    if (Platform.OS !== 'ios') {
      this.isSupported = false;
      return;
    }

    try {
      const supported = await this.module.areActivitiesEnabled();
      this.isSupported = supported;
    } catch (error) {
      console.warn('Failed to check Live Activities support:', error);
      this.isSupported = false;
    }
  }

  /**
   * Check if Live Activities are currently supported
   */
  async isSupportedAsync(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    if (this.isSupported !== undefined) {
      return this.isSupported;
    }

    await this.checkSupport();
    return this.isSupported;
  }

  /**
   * Start a Live Activity for an ongoing order
   */
  async startActivity(
    attributes: OrderLiveActivityAttributes,
    initialState: OrderLiveActivityContentState,
  ): Promise<string | null> {
    if (Platform.OS !== 'ios') {
      return null;
    }

    try {
      // End any existing activity before starting a new one
      if (this.currentActivityId) {
        await this.endActivity();
      }

      const activityId = await this.module.startActivity(
        'FoodifyOrderTracking',
        attributes,
        initialState,
      );

      this.currentActivityId = activityId;
      console.log('Live Activity started with ID:', activityId);
      return activityId;
    } catch (error) {
      console.error('Failed to start Live Activity:', error);
      return null;
    }
  }

  /**
   * Update the current Live Activity with new state
   */
  async updateActivity(contentState: OrderLiveActivityContentState): Promise<boolean> {
    if (Platform.OS !== 'ios' || !this.currentActivityId) {
      return false;
    }

    try {
      await this.module.updateActivity(this.currentActivityId, contentState);
      console.log('Live Activity updated:', this.currentActivityId);
      return true;
    } catch (error) {
      console.error('Failed to update Live Activity:', error);
      return false;
    }
  }

  /**
   * End the current Live Activity
   */
  async endActivity(): Promise<boolean> {
    if (Platform.OS !== 'ios' || !this.currentActivityId) {
      return false;
    }

    try {
      await this.module.endActivity(this.currentActivityId);
      console.log('Live Activity ended:', this.currentActivityId);
      this.currentActivityId = null;
      return true;
    } catch (error) {
      console.error('Failed to end Live Activity:', error);
      this.currentActivityId = null;
      return false;
    }
  }

  /**
   * Get the current activity ID if one is active
   */
  getCurrentActivityId(): string | null {
    return this.currentActivityId;
  }

  /**
   * Check if there's an active Live Activity
   */
  hasActiveActivity(): boolean {
    return this.currentActivityId !== null;
  }
}

// Export singleton instance
export const liveActivityService = new LiveActivityService();

/**
 * Helper function to create Live Activity attributes from order data
 */
export function createLiveActivityAttributes(
  order: OngoingOrderData,
  statusLabel: string,
  orderTotal?: string,
): OrderLiveActivityAttributes | null {
  if (!order.orderId) {
    return null;
  }

  const restaurantName = order.restaurant?.name ?? 'Restaurant';
  const itemsCount = order.items?.length ?? 0;

  return {
    orderId: String(order.orderId),
    restaurantName,
    restaurantImageUrl: order.restaurant?.imageUrl ?? undefined,
    status: order.status ?? 'PENDING',
    statusLabel,
    estimatedReadyAt: order.estimatedReadyAt ?? undefined,
    courierName: (order.delivery as any)?.courier?.name ?? undefined,
    courierRating: (order.delivery as any)?.courier?.rating
      ? String((order.delivery as any).courier.rating)
      : undefined,
    orderTotal,
    itemsCount,
  };
}

/**
 * Helper function to create Live Activity content state from order data
 */
export function createLiveActivityContentState(
  order: OngoingOrderData,
  statusLabel: string,
): OrderLiveActivityContentState {
  return {
    status: order.status ?? 'PENDING',
    statusLabel,
    estimatedReadyAt: order.estimatedReadyAt ?? undefined,
    courierName: (order.delivery as any)?.courier?.name ?? undefined,
    courierRating: (order.delivery as any)?.courier?.rating
      ? String((order.delivery as any).courier.rating)
      : undefined,
    lastUpdatedAt: new Date().toISOString(),
  };
}

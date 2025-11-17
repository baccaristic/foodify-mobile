import { useLiveActivity } from '~/hooks/useLiveActivity';

/**
 * Component that manages iOS Live Activities for ongoing orders.
 * Should be placed inside the OngoingOrderProvider context.
 */
export function LiveActivityManager() {
  // Initialize Live Activity management
  useLiveActivity();

  // This component doesn't render anything
  return null;
}

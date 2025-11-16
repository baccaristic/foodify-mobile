# iOS Live Activity for Order Tracking

## Overview

This implementation adds iOS Live Activity support (iOS 16.1+) for ongoing food delivery orders in the Foodify mobile app. Live Activities allow users to track their order status directly from the lock screen and Dynamic Island without opening the app.

## Features

- **Automatic Lifecycle Management**: Live Activities start automatically when an order begins and end when delivered/cancelled
- **Real-time Updates**: Order status updates are pushed to the Live Activity via WebSocket connections
- **Dynamic Island Support**: Special UI for iPhone 14 Pro and later models
- **Lock Screen Widget**: Persistent order tracking on the lock screen
- **Smart State Management**: Prevents duplicate activities and handles edge cases

## Architecture

### JavaScript Layer

1. **Service** (`src/services/liveActivity.ts`):
   - Native module interface with fallback mock implementation
   - Manages activity lifecycle (start, update, end)
   - Helper functions to transform order data into activity attributes

2. **Hook** (`src/hooks/useLiveActivity.ts`):
   - React hook that monitors the `OngoingOrderContext`
   - Automatically triggers activity updates based on order status changes
   - Handles terminal states (DELIVERED, CANCELLED, REJECTED)

3. **Component** (`src/components/LiveActivityManager.tsx`):
   - Invisible component that initializes Live Activity management
   - Integrated into the app's component tree within `OngoingOrderProvider`

### Native Layer (To Be Implemented)

The native iOS implementation requires:
1. Native Swift module (`LiveActivityModule`)
2. Activity attributes struct (`FoodifyOrderTrackingAttributes`)
3. Widget Extension with Live Activity UI
4. ActivityKit framework integration

See `docs/LIVE_ACTIVITY_IMPLEMENTATION.md` for detailed native implementation instructions.

## Integration

The Live Activity system is automatically integrated into the app through the `App.tsx` component:

```tsx
<OngoingOrderProvider>
  <LiveActivityManager />
  {/* Other providers and components */}
</OngoingOrderProvider>
```

No additional setup is needed in the JavaScript layer - the system works automatically once the native module is implemented.

## Order Status Flow

The Live Activity displays and updates through these order statuses:

1. **PENDING** - Order received by restaurant
2. **ACCEPTED** - Restaurant accepted the order
3. **PREPARING** - Food is being prepared
4. **READY_FOR_PICK_UP** - Order ready for courier pickup
5. **IN_DELIVERY** - Courier is delivering the order
6. **DELIVERED** - Order delivered (activity ends after 3 seconds)
7. **CANCELLED/REJECTED** - Order cancelled (activity ends)

## Data Displayed

The Live Activity shows:
- Restaurant name
- Order ID
- Current status
- Courier name (when assigned)
- Estimated delivery/ready time

## Development

### Mock Implementation

In development, a mock implementation logs activity events to the console:

```
[Mock Live Activity] Starting activity: { activityType, attributes, contentState }
[Mock Live Activity] Updating activity: activityId contentState
[Mock Live Activity] Ending activity: activityId
```

### Testing

To test the full Live Activity implementation:

1. Run `expo prebuild` to generate the iOS project
2. Implement the native module (see `docs/LIVE_ACTIVITY_IMPLEMENTATION.md`)
3. Build and run on a physical iOS device (iOS 16.1+)
4. Place an order and observe the Live Activity on the lock screen

## Configuration

The app is pre-configured in `app.config.js`:

```javascript
ios: {
  infoPlist: {
    NSSupportsLiveActivities: true,
  },
}
```

## Requirements

- iOS 16.1+ for Live Activities
- iPhone 14 Pro or later for Dynamic Island
- Physical device for testing (Live Activities have limited simulator support)
- ActivityKit framework
- WidgetKit for the widget extension

## Future Enhancements

Possible improvements:
- Push notification updates for background updates
- Enhanced Dynamic Island animations
- More detailed delivery tracking information
- Interactive buttons (e.g., contact courier, view order details)
- Estimated time remaining countdown

## Troubleshooting

**Live Activity not appearing:**
- Verify iOS version is 16.1+
- Check that native module is properly implemented
- Ensure app has proper entitlements
- Verify `NSSupportsLiveActivities` is set in Info.plist

**Activity not updating:**
- Check WebSocket connection is active
- Verify order status changes are being received
- Check console for mock implementation logs

**Multiple activities appearing:**
- The system automatically ends previous activities when starting a new one
- Check that `currentActivityId` is properly managed

## References

- [Apple ActivityKit Documentation](https://developer.apple.com/documentation/activitykit)
- [Live Activities Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/live-activities)
- [Dynamic Island Guidelines](https://developer.apple.com/design/human-interface-guidelines/dynamic-island)

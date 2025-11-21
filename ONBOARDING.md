# Onboarding Wizard Feature

## Overview
The onboarding wizard guides first-time users through the app's core workflow: browsing restaurants, selecting menu items, customizing orders, and checking out.

## Architecture

### Components

#### OnboardingContext (`src/context/OnboardingContext.tsx`)
- Manages the onboarding state throughout the app
- Tracks the current onboarding step
- Stores completion status in SecureStore
- Provides hooks to control onboarding flow

**Steps:**
1. `restaurant_menu_item` - Highlights first menu item in restaurant details
2. `menu_detail_extras` - Highlights extras/options selection
3. `menu_detail_plus` - Highlights quantity adjustment button
4. `menu_detail_add_cart` - Highlights add to cart button
5. `fixed_order_bar` - Highlights go to cart button
6. `cart_checkout` - Highlights checkout button
7. `completed` - Onboarding finished

#### OnboardingOverlay (`src/components/OnboardingOverlay.tsx`)
- Renders a semi-transparent overlay with blur effect
- Creates a spotlight effect around highlighted elements
- Shows tooltip with title, description, and navigation buttons
- Supports skip functionality

#### useElementMeasurement (`src/hooks/useElementMeasurement.ts`)
- Custom hook to measure UI element positions
- Returns ref, measurement, and measure function
- Used to position spotlight highlights

### Integration Points

#### App.tsx
- Wraps app with `OnboardingProvider`

#### RestaurantDetails.tsx
- Starts onboarding when restaurant loads (if not completed)
- Highlights first menu item
- Advances to next step when menu item is tapped
- Highlights fixed order bar when cart has items

#### MenuDetail.tsx
- Highlights first option group (extras)
- Highlights plus button for quantity adjustment
- Highlights add to cart button
- Advances through steps as user interacts

#### Cart.tsx
- Highlights checkout button
- Completes onboarding when checkout is tapped

#### FixedOrderBar.tsx
- Modified to support ref forwarding for measurement
- Integrated with onboarding flow

### Localization

Translations are provided in:
- `src/localization/resources/en.ts`
- `src/localization/resources/fr.ts`
- `src/localization/resources/ar.ts`

Translation keys:
- `onboarding.restaurantMenuItem.*`
- `onboarding.menuDetailExtras.*`
- `onboarding.menuDetailPlus.*`
- `onboarding.menuDetailAddCart.*`
- `onboarding.fixedOrderBar.*`
- `onboarding.cartCheckout.*`

## User Flow

1. User opens app for the first time
2. Navigates to a restaurant
3. Onboarding automatically starts
4. First menu item is highlighted with explanation
5. User taps menu item
6. Extras/options are highlighted
7. User sees plus button highlighted
8. Add to cart button is highlighted
9. User adds item to cart
10. Go to cart button is highlighted in fixed order bar
11. User goes to cart
12. Checkout button is highlighted
13. User taps checkout (onboarding completes)

## Technical Details

### Storage
- Onboarding completion status is stored in SecureStore with key `onboarding_completed`
- Value is `'true'` when completed

### Measurement Timing
- Elements are measured 300-500ms after step changes
- Allows for animations and rendering to complete
- Ensures accurate positioning of spotlight

### Spotlight Effect
- Uses overlays to create dark regions around highlighted element
- Border highlight with theme color (#CA251B)
- Shadow effect for prominence

### Skip Functionality
- Users can skip at any point
- Marks onboarding as completed immediately
- Prevents future onboarding sessions

## Testing

To test the onboarding flow:
1. Clear app data or use new device
2. Launch app and sign in
3. Navigate to a restaurant
4. Onboarding should start automatically
5. Follow the highlighted steps
6. Verify each step advances correctly
7. Test skip functionality

To reset onboarding:
- Clear SecureStore key `onboarding_completed`
- Or reinstall app

## Future Enhancements

Potential improvements:
- Add progress indicator showing step X of Y
- Support for landscape orientation
- Customizable delay before auto-start
- Analytics tracking for completion rates
- A/B testing different onboarding flows
- Admin panel to enable/disable onboarding
- Different onboarding flows for different user types

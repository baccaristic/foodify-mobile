# Onboarding Wizard Feature

## Overview
The onboarding wizard guides first-time users through the complete app workflow: browsing restaurants, selecting menu items, customizing orders, checking out, tracking delivery, and managing their profile.

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
7. `checkout_address` - Highlights delivery address section
8. `checkout_payment` - Highlights payment method selection
9. `checkout_place_order` - Highlights place order button
10. `order_tracking_status` - Auto-advances when viewing order
11. `order_tracking_delivery_code` - Highlights delivery verification code (IN_DELIVERY status)
12. `profile_points` - Highlights loyalty points balance
13. `profile_loyalty` - Highlights loyalty rewards menu item
14. `profile_favorites` - Highlights favorites menu item
15. `profile_settings` - Highlights settings menu item
16. `completed` - Onboarding finished

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
- Advances to next step when checkout is tapped (continues to CheckoutOrder)

#### CheckoutOrder.tsx
- Highlights delivery address section
- Highlights payment method selection
- Highlights place order button
- When in view mode with IN_DELIVERY status, highlights delivery verification code
- Auto-advances order_tracking_status step after 1 second
- Advances to profile_points step after delivery code

#### ProfileScreen.tsx
- Highlights loyalty points badge at top of profile
- Highlights loyalty rewards menu item (with special emphasis on points)
- Highlights favorites menu item
- Highlights settings menu item
- Completes onboarding after settings step

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
- `onboarding.checkoutAddress.*`
- `onboarding.checkoutPayment.*`
- `onboarding.checkoutPlaceOrder.*`
- `onboarding.orderTrackingStatus.*`
- `onboarding.orderTrackingDeliveryCode.*`
- `onboarding.profilePoints.*`
- `onboarding.profileLoyalty.*`
- `onboarding.profileFavorites.*`
- `onboarding.profileSettings.*`

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
13. User taps checkout
14. **Delivery address section is highlighted**
15. **User reviews/changes address**
16. **Payment method is highlighted**
17. **User selects payment method**
18. **Place order button is highlighted**
19. **User places order**
20. **Order tracking opens (status auto-advances after 1s)**
21. **When order reaches IN_DELIVERY status, delivery code is highlighted**
22. **User understands they need to share this code with the driver**
23. **User navigates to Profile tab**
24. **Loyalty points balance is highlighted (especially emphasized)**
25. **Loyalty rewards menu item is highlighted**
26. **User can tap to explore rewards and point conversion**
27. **Favorites menu item is highlighted**
28. **Profile settings menu item is highlighted**
29. **Onboarding completes after settings step**

## Technical Details

### Storage
- Onboarding completion status is stored in SecureStore with key `onboarding_completed`
- Value is `'true'` when completed

### Measurement Timing
- Elements are measured 300-500ms after step changes
- Allows for animations and rendering to complete
- Ensures accurate positioning of spotlight
- Order tracking status step auto-advances after 1 second

### Spotlight Effect
- Uses overlays to create dark regions around highlighted element
- Border highlight with theme color (#CA251B)
- Shadow effect for prominence

### Skip Functionality
- Users can skip at any point
- Marks onboarding as completed immediately
- Prevents future onboarding sessions

## Testing

To test the complete onboarding flow:
1. Clear app data or use new device
2. Launch app and sign in
3. Navigate to a restaurant
4. Onboarding should start automatically
5. Follow the highlighted steps through:
   - Menu item selection
   - Item customization
   - Add to cart
   - View cart
   - Checkout
   - Address confirmation
   - Payment method selection
   - Place order
6. Order tracking opens automatically (status step auto-advances)
7. When order status becomes IN_DELIVERY, view the order to see delivery code highlighted
8. Navigate to Profile tab to continue onboarding:
   - Points balance highlight
   - Loyalty rewards menu item
   - Favorites menu item
   - Settings menu item
9. Verify each step advances correctly
10. Test skip functionality at any point

To reset onboarding:
- Clear SecureStore key `onboarding_completed`
- Or reinstall app
- Or use `resetOnboarding()` utility function from `src/utils/onboarding.ts`

## Future Enhancements

Potential improvements:
- Add progress indicator showing step X of Y
- Support for landscape orientation
- Customizable delay before auto-start
- Analytics tracking for completion rates
- A/B testing different onboarding flows
- Admin panel to enable/disable onboarding
- Different onboarding flows for different user types

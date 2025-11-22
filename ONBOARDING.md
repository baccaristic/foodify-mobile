# Onboarding Wizard Feature

## Overview
The onboarding wizard provides **two independent onboarding flows**:
1. **Ordering Flow** - Guides users through browsing restaurants, ordering, and delivery (11 steps)
2. **Profile Flow** - Highlights profile features on first visit to Profile screen (4 steps)

These flows are completely independent and can be completed separately.

## Architecture

### Components

#### OnboardingContext (`src/context/OnboardingContext.tsx`)
- Manages the onboarding state throughout the app
- Tracks the current onboarding step
- Stores completion status in SecureStore (separate keys for ordering and profile)
- Provides hooks to control onboarding flow

**Ordering Flow Steps (1-11):**
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

**Profile Flow Steps (12-15) - Independent:**
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
- **Completes ordering onboarding after delivery code step**

#### ProfileScreen.tsx
- **Independent onboarding flow - triggers on first visit to Profile screen**
- Checks profile onboarding completion status separately
- Highlights loyalty points badge at top of profile
- Highlights loyalty rewards menu item (with special emphasis on points)
- Highlights favorites menu item
- Highlights settings menu item
- Completes profile onboarding after settings step (separate from ordering onboarding)

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

### Ordering Flow (11 Steps)
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
23. **Ordering onboarding completes**

### Profile Flow (4 Steps - Independent)
1. **User navigates to Profile tab for the first time**
2. **Profile onboarding automatically starts**
3. **Loyalty points balance is highlighted (especially emphasized)**
4. **Loyalty rewards menu item is highlighted**
5. **User can tap to explore rewards and point conversion**
6. **Favorites menu item is highlighted**
7. **Profile settings menu item is highlighted**
8. **Profile onboarding completes**

## Technical Details

### Storage
- Ordering onboarding completion status is stored in SecureStore with key `onboarding_completed`
- Profile onboarding completion status is stored separately with key `profile_onboarding_completed`
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
- Skipping ordering onboarding doesn't affect profile onboarding (they are independent)

### Independent Flows
- **Ordering Flow**: Starts automatically when navigating to a restaurant for the first time
- **Profile Flow**: Starts automatically on first visit to Profile screen
- Can be completed in any order
- Completion status tracked separately for each flow

## Testing

To test the ordering onboarding flow:
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
8. Ordering onboarding completes
9. Verify each step advances correctly
10. Test skip functionality at any point

To test the profile onboarding flow (independent):
1. Clear profile onboarding status (see reset instructions below)
2. Navigate to Profile tab
3. Profile onboarding should start automatically
4. Follow the highlighted steps:
   - Points balance highlight
   - Loyalty rewards menu item
   - Favorites menu item
   - Settings menu item
5. Profile onboarding completes
6. Test skip functionality

To reset onboarding:
- **Ordering onboarding**: Clear SecureStore key `onboarding_completed` or reinstall app
- **Profile onboarding**: Clear SecureStore key `profile_onboarding_completed`
- Use `resetOnboarding()` utility function from `src/utils/onboarding.ts` for ordering flow
- You can reset each flow independently

## Future Enhancements

Potential improvements:
- Add progress indicator showing step X of Y
- Support for landscape orientation
- Customizable delay before auto-start
- Analytics tracking for completion rates
- A/B testing different onboarding flows
- Admin panel to enable/disable onboarding
- Different onboarding flows for different user types

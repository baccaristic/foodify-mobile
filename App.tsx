import './global.css';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import queryClient from '~/api/queryClient';
import AuthScreen from '~/screens/Auth/AuthScreen';
import AcceptTerms from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/AcceptTerms';
import EmailLogin from '~/screens/Auth/AuthWithEmail.tsx/EmailLogin';
import LocationAccess from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/LocationAccess';
import NameEntry from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/NameEntry';
import PhoneNumberEntry from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/PhoneNumberEntry';
import SignUpEmailPassword from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/SignUpEmailPassword';
import EmailVerificationCode from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/EmailVerificationCode';
import EmailPhoneVerificationCode from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/EmailPhoneVerificationCode';
import PhoneEmailEntry from '~/screens/Auth/AuthWithPhone.tsx/EmailEntry';
import PhoneNameEntry from '~/screens/Auth/AuthWithPhone.tsx/NameEntry';
import PhoneVerificationCode from '~/screens/Auth/AuthWithPhone.tsx/PhoneVerificationCode';
import PhoneEmailVerificationCode from '~/screens/Auth/AuthWithPhone.tsx/EmailVerificationCode';
import PhoneAcceptTerms from '~/screens/Auth/AuthWithPhone.tsx/AcceptTerms';
import Cart from '~/screens/Cart';
import CheckoutOrder from '~/screens/CheckoutOrder';
import CouponCode from '~/screens/CouponCode';
import Home from '~/screens/Home';
import LandingScreen from '~/screens/LandingScreen';
import OrderTracking from '~/screens/OrderTracking';
import LiveChatScreen from '~/screens/LiveChatScreen';
import LocationPermissionScreen from '~/screens/LocationPermissionScreen';
import LocationSelectionScreen from '~/screens/LocationSelectionScreen';
import ProfileScreen from '~/screens/Profile/ProfileScreen';
import OrderHistoryScreen from '~/screens/Profile/OrderHistoryScreen';
import RestaurantDetails from '~/screens/RestaurantDetails';
import SearchScreen from '~/screens/SearchScreen';
import { CartProvider } from '~/context/CartContext';
import { AuthProvider } from '~/context/AuthContext';
import { EmailSignupProvider } from '~/context/EmailSignupContext';
import { LocationOverlayProvider } from '~/context/LocationOverlayContext';
import { PhoneSignupProvider } from '~/context/PhoneSignupContext';
import { SelectedAddressProvider } from '~/context/SelectedAddressContext';
import { WebSocketProvider } from '~/context/WebSocketContext';
import { OngoingOrderProvider } from '~/context/OngoingOrderContext';
import { DeliveryRatingOverlayProvider } from '~/context/DeliveryRatingOverlayContext';
import { RestaurantRatingOverlayProvider } from '~/context/RestaurantRatingOverlayContext';
import { SystemStatusOverlayProvider } from '~/context/SystemStatusOverlayContext';
import DeliveredCelebrationOverlay from '~/components/DeliveredCelebrationOverlay';
import DeliveryRatingOverlay from '~/components/DeliveryRatingOverlay';
import RestaurantRatingOverlay from '~/components/RestaurantRatingOverlay';
import useAuth from '~/hooks/useAuth';
import { checkLocationAccess } from '~/services/locationAccess';
import { checkPushNotificationPermissions } from '~/services/notifications';
import Notification from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/Notifications';
import NotificationsScreen from '~/screens/Profile/NotificationsScreen';
import DeleteAccountScreen from '~/screens/Profile/DeleteAccountScreen';
import FAQScreen from '~/screens/Profile/FAQScreen';
import PrivacyScreen from '~/screens/Profile/PrivacyScreen';
import ProfileSettingsScreen from '~/screens/Profile/ProfilSettingsScreen';
import CouponCodeScreen from '~/screens/Profile/CouponCodeScreen';
import FavoritesScreen from '~/screens/Profile/FavoritesScreen';
import LanguageSettingsScreen from '~/screens/Profile/LanguageSettingsScreen';
import LoyaltyRewardsScreen from '~/screens/Profile/LoyaltyRewardsScreen';
import { LocalizationProvider } from '~/localization';
import ConvertPointsScreen from '~/screens/Profile/ConvertPointsScreen';

const Stack = createNativeStackNavigator();

const LoadingView = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
    <ActivityIndicator size="large" color="#17213A" />
  </View>
);

const RootNavigator = () => {
  const { user, isLoading } = useAuth();
  const [locationCheckComplete, setLocationCheckComplete] = useState(false);
  const [needsLocationPermission, setNeedsLocationPermission] = useState(false);
  const [notificationCheckComplete, setNotificationCheckComplete] = useState(false);
  const [needsNotificationPermission, setNeedsNotificationPermission] = useState(false);
  const [hasSeenLanding, setHasSeenLanding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setNeedsLocationPermission(false);
      setLocationCheckComplete(true);
      setNeedsNotificationPermission(false);
      setNotificationCheckComplete(true);
      setHasSeenLanding(false); // Reset landing screen state when logged out
      return () => {
        cancelled = true;
      };
    }

    setLocationCheckComplete(false);

    checkLocationAccess()
      .then((result) => {
        if (!cancelled) {
          setNeedsLocationPermission(!result.granted);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNeedsLocationPermission(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLocationCheckComplete(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    setNotificationCheckComplete(false);

    checkPushNotificationPermissions()
      .then((result) => {
        if (!cancelled) {
          setNeedsNotificationPermission(result.isDevice ? !result.granted : false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNeedsNotificationPermission(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setNotificationCheckComplete(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isLoading || (user && (!locationCheckComplete || !notificationCheckComplete))) {
    return <LoadingView />;
  }

  const navigationKey = user
    ? needsLocationPermission
      ? 'auth-stack-location'
      : needsNotificationPermission
      ? 'auth-stack-notification'
      : hasSeenLanding
      ? 'auth-stack'
      : 'auth-stack-landing'
    : 'guest-stack';

  const initialRouteName = user
    ? needsLocationPermission
      ? 'LocationPermission'
      : needsNotificationPermission
      ? 'Notification'
      : hasSeenLanding
      ? 'Home'
      : 'Landing'
    : 'Guest';

  return (
    <>
      <Stack.Navigator
        key={navigationKey}
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
      {user ? (
        <>
          <Stack.Screen name="Guest" component={AuthScreen} />
          <Stack.Screen name="Landing">
            {(props) => (
              <LandingScreen
                {...props}
                onComplete={() => setHasSeenLanding(true)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="LocationPermission"
            initialParams={{ nextRoute: 'Notification', resetOnComplete: false }}
          >
            {(props) => (
              <LocationPermissionScreen
                {...props}
                onComplete={() => setNeedsLocationPermission(false)}
                onSkip={() => setNeedsLocationPermission(false)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Notification">
            {() => (
              <Notification
                onComplete={() => setNeedsNotificationPermission(false)}
                onSkip={() => setNeedsNotificationPermission(false)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Cart" component={Cart} />
          <Stack.Screen name="CheckoutOrder" component={CheckoutOrder} />
          <Stack.Screen name="OrderTracking" component={OrderTracking} />
          <Stack.Screen name="LiveChat" component={LiveChatScreen} />
          <Stack.Screen name="CouponCode" component={CouponCode} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="RestaurantDetails" component={RestaurantDetails} />
          <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
          <Stack.Screen name="FAQ" component={FAQScreen} />
          <Stack.Screen name="ManagePrivacy" component={PrivacyScreen} />
          <Stack.Screen name="CouponCodes" component={CouponCodeScreen} />
          <Stack.Screen name="LoyaltyRewards" component={LoyaltyRewardsScreen} />
          <Stack.Screen name="ConvertPoints" component={ConvertPointsScreen} />
          <Stack.Screen name="ProfilSettings" component={ProfileSettingsScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Guest" component={AuthScreen} />
          <Stack.Group>
            <Stack.Screen name="Login" component={EmailLogin} />
            <Stack.Screen name="LocationAccess" component={LocationAccess} />
            <Stack.Screen name="NameEntry" component={NameEntry} />
            <Stack.Screen name="PhoneVerificationCode" component={PhoneVerificationCode} />
            <Stack.Screen
              name="EmailPhoneVerificationCode"
              component={EmailPhoneVerificationCode}
            />
            <Stack.Screen name="PhoneNumberEntry" component={PhoneNumberEntry} />
            <Stack.Screen name="AcceptTerms" component={AcceptTerms} />
            <Stack.Screen name="SignUpEmailPassword" component={SignUpEmailPassword} />
            <Stack.Screen name="PhoneEmailEntry" component={PhoneEmailEntry} />
            <Stack.Screen
              name="PhoneEmailVerificationCode"
              component={PhoneEmailVerificationCode}
            />
            <Stack.Screen name="PhoneNameEntry" component={PhoneNameEntry} />
            <Stack.Screen name="PhoneAcceptTerms" component={PhoneAcceptTerms} />
            <Stack.Screen name="EmailVerificationCode" component={EmailVerificationCode} />
            <Stack.Screen name="Notification" component={Notification} />
          </Stack.Group>
        </>
      )}
      </Stack.Navigator>
      <DeliveredCelebrationOverlay />
      <DeliveryRatingOverlay />
      <RestaurantRatingOverlay />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <LocalizationProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <AuthProvider>
              <EmailSignupProvider>
                <OngoingOrderProvider>
                  <DeliveryRatingOverlayProvider>
                    <RestaurantRatingOverlayProvider>
                      <WebSocketProvider>
                        <PhoneSignupProvider>
                          <SelectedAddressProvider>
                            <CartProvider>
                              <LocationOverlayProvider>
                                <SystemStatusOverlayProvider>
                                  <RootNavigator />
                                </SystemStatusOverlayProvider>
                              </LocationOverlayProvider>
                            </CartProvider>
                          </SelectedAddressProvider>
                        </PhoneSignupProvider>
                      </WebSocketProvider>
                    </RestaurantRatingOverlayProvider>
                  </DeliveryRatingOverlayProvider>
                </OngoingOrderProvider>
              </EmailSignupProvider>
            </AuthProvider>
          </NavigationContainer>
        </QueryClientProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}

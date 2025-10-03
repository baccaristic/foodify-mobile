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
import PhoneEmailEntry from '~/screens/Auth/AuthWithPhone.tsx/EmailEntry';
import PhoneNameEntry from '~/screens/Auth/AuthWithPhone.tsx/NameEntry';
import PhoneVerificationCode from '~/screens/Auth/AuthWithPhone.tsx/PhoneVerificationCode';
import PhoneAcceptTerms from '~/screens/Auth/AuthWithPhone.tsx/AcceptTerms';
import Cart from '~/screens/Cart';
import CheckoutOrder from '~/screens/CheckoutOrder';
import CouponCode from '~/screens/CouponCode';
import Home from '~/screens/Home';
import OrderTracking from '~/screens/OrderTracking';
import LocationPermissionScreen from '~/screens/LocationPermissionScreen';
import LocationSelectionScreen from '~/screens/LocationSelectionScreen';
import ProfileScreen from '~/screens/Profile/ProfileScreen';
import OrderHistoryScreen from '~/screens/Profile/OrderHistoryScreen';
import AccountScreen from '~/screens/Profile/AccountScreen';
import RestaurantDetails from '~/screens/RestaurantDetails';
import SearchScreen from '~/screens/SearchScreen';
import { CartProvider } from '~/context/CartContext';
import { AuthProvider } from '~/context/AuthContext';
import { LocationOverlayProvider } from '~/context/LocationOverlayContext';
import { PhoneSignupProvider } from '~/context/PhoneSignupContext';
import { SelectedAddressProvider } from '~/context/SelectedAddressContext';
import useAuth from '~/hooks/useAuth';
import { checkLocationAccess } from '~/services/locationAccess';

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

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setNeedsLocationPermission(false);
      setLocationCheckComplete(true);
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

  if (isLoading || (user && !locationCheckComplete)) {
    return <LoadingView />;
  }

  const navigationKey = user
    ? needsLocationPermission
      ? 'auth-stack-location'
      : 'auth-stack'
    : 'guest-stack';

  const initialRouteName = user
    ? needsLocationPermission
      ? 'LocationPermission'
      : 'Home'
    : 'Guest';

  return (
    <Stack.Navigator
      key={navigationKey}
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      {user ? (
        <>
          <Stack.Screen name="LocationPermission">
            {(props) => (
              <LocationPermissionScreen
                {...props}
                onComplete={() => setNeedsLocationPermission(false)}
                onSkip={() => setNeedsLocationPermission(false)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Cart" component={Cart} />
          <Stack.Screen name="CheckoutOrder" component={CheckoutOrder} />
          <Stack.Screen name="OrderTracking" component={OrderTracking} />
          <Stack.Screen name="CouponCode" component={CouponCode} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="AccountSettings" component={AccountScreen} />
          <Stack.Screen name="RestaurantDetails" component={RestaurantDetails} />
          <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Guest" component={AuthScreen} />
          <Stack.Group>
            <Stack.Screen name="Login" component={EmailLogin} />
            <Stack.Screen name="LocationAccess" component={LocationAccess} />
            <Stack.Screen name="NameEntry" component={NameEntry} />
            <Stack.Screen name="PhoneVerificationCode" component={PhoneVerificationCode} />
            <Stack.Screen name="PhoneNumberEntry" component={PhoneNumberEntry} />
            <Stack.Screen name="AcceptTerms" component={AcceptTerms} />
            <Stack.Screen name="SignUpEmailPassword" component={SignUpEmailPassword} />
            <Stack.Screen name="PhoneEmailEntry" component={PhoneEmailEntry} />
            <Stack.Screen name="PhoneNameEntry" component={PhoneNameEntry} />
            <Stack.Screen name="PhoneAcceptTerms" component={PhoneAcceptTerms} />
            <Stack.Screen name="EmailVerificationCode" component={EmailVerificationCode} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <AuthProvider>
            <PhoneSignupProvider>
              <SelectedAddressProvider>
                <CartProvider>
                  <LocationOverlayProvider>
                    <RootNavigator />
                  </LocationOverlayProvider>
                </CartProvider>
              </SelectedAddressProvider>
            </PhoneSignupProvider>
          </AuthProvider>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

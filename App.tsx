import './global.css';
import Home from '~/screens/Home';
import RestaurantDetails from '~/screens/RestaurantDetails';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import Cart from '~/screens/Cart';
import AuthScreen from '~/screens/Auth/AuthScreen';
import useAuth from '~/hooks/useAuth';
import LocationSelectionScreen from '~/screens/LocationSelectionScreen';
import EmailLogin from '~/screens/Auth/AuthWithEmail.tsx/EmailLogin';
import OrderHistoryScreen from '~/screens/Profile/OrderHistoryScreen';
import AccountScreen from '~/screens/Profile/AccountScreen';
import ProfileScreen from '~/screens/Profile/ProfileScreen';
import SearchScreen from '~/screens/SearchScreen';
import { AuthProvider } from '~/context/AuthContext';
import { LocationOverlayProvider } from '~/context/LocationOverlayContext';
import AcceptTerms from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/AcceptTerms';
import LocationAccess from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/LocationAccess';
import NameEntry from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/NameEntry';
import PhoneNumberEntry from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/PhoneNumberEntry';
import SignUpEmailPassword from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/SignUpEmailPassword';
import EmailEntry from '~/screens/Auth/AuthWithPhone.tsx/EmailEntry';
import EmailVerificationCode from '~/screens/Auth/AuthWithEmail.tsx/EmailSignUp/EmailVerificationCode';
import PhoneVerificationCode from '~/screens/Auth/AuthWithPhone.tsx/PhoneVerificationCode';

const Stack = createNativeStackNavigator();

const LoadingView = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
    <ActivityIndicator size="large" color="#17213A" />
  </View>
);

const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingView />;
  }

  const navigationKey = user ? 'auth-stack' : 'guest-stack';

  return (
    <Stack.Navigator
      key={navigationKey}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      {user ? (
        <>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Cart" component={Cart} />
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
        <Stack.Screen name="Login" component={EmailLogin} options={{headerShown: false}}></Stack.Screen>
        <Stack.Screen name="LocationAccess" component={LocationAccess} options={{headerShown: false}}></Stack.Screen>
        <Stack.Screen name="NameEntry" component={NameEntry} options={{headerShown: false}}></Stack.Screen>
        <Stack.Screen name="PhoneVerificationCode" component={PhoneVerificationCode} options={{headerShown: false}}></Stack.Screen>
        <Stack.Screen name="PhoneNumberEntry" component={PhoneNumberEntry} options={{headerShown: false}}></Stack.Screen>
        <Stack.Screen name="AcceptTerms" component={AcceptTerms} options={{headerShown: false}}></Stack.Screen>
        <Stack.Screen name="SignUpEmailPassword" component={SignUpEmailPassword} options={{headerShown: false}}></Stack.Screen>
         <Stack.Screen name="EmailEntry" component={EmailEntry} options={{headerShown: false}}></Stack.Screen>
        <Stack.Screen name="EmailVerificationCode" component={EmailVerificationCode} options={{headerShown: false}}></Stack.Screen>
        </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
      <AuthProvider>
        <LocationOverlayProvider>
            <RootNavigator />
        </LocationOverlayProvider>
      </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

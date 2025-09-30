import './global.css';
import Home from '~/screens/Home';
import RestaurantDetails from '~/screens/RestaurantDetails';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Cart from '~/screens/Cart';
import AuthScreen from '~/screens/Auth/AuthScreen';
import EmailLogin from '~/screens/Auth/AuthWithEmail.tsx/EmailLogin';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
      <Stack.Navigator initialRouteName="Guest">
        <Stack.Screen name="Guest" component={AuthScreen} options={{headerShown: false}}>
        </Stack.Screen>

        <Stack.Screen name="Login" component={EmailLogin} options={{headerShown: false}}>

        </Stack.Screen>
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ headerShown: false }} // Hide header if using custom header in MainLayout
        />
        <Stack.Screen 
          name="RestaurantDetails" 
          component={RestaurantDetails} 
          options={{ headerShown: false }} // Hide header if using custom header in MainLayout
        />
        <Stack.Screen
        name="Cart"
        component={Cart}
        options={{headerShown:false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

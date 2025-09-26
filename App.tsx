import './global.css';
import Home from '~/screens/Home';
import RestaurantDetails from '~/screens/RestaurantDetails';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
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
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

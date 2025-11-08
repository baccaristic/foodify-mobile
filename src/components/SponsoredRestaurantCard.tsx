import React, { useEffect } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ScaledSheet } from 'react-native-size-matters';
import { BASE_API_URL } from '@env';

interface SponsoredRestaurantCardProps {
  restaurantId: number;
  name: string;
  logoUrl?: string | null;
  position: number;
  onPress: () => void;
}

const SponsoredRestaurantCard: React.FC<SponsoredRestaurantCardProps> = ({
  name,
  logoUrl,
  onPress,
}) => {
  // Heartbeat animation
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.container}>
      <Animated.View style={[styles.cardWrapper, animatedStyle]}>
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Image
              source={
                logoUrl
                  ? { uri: `${BASE_API_URL}/auth/image/${logoUrl}` }
                  : require('../../assets/baguette.png')
              }
              style={styles.logo}
              contentFit="cover"
            />
          </View>
        </View>
        <Text allowFontScaling={false} style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  container: {
    marginRight: '16@s',
    alignItems: 'center',
  },
  cardWrapper: {
    // This wrapper applies the animation
  },
  card: {
    width: '100@s',
    height: '100@s',
    backgroundColor: '#FFFFFF',
    borderRadius: '16@ms',
    alignItems: 'center',
    justifyContent: 'center',
    // 3D shadow effects
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  logoContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  name: {
    marginTop: '8@vs',
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    maxWidth: '100@s',
  },
});

export default SponsoredRestaurantCard;

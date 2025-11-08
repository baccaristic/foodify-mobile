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
              contentFit="contain"
            />
          </View>
          <Text allowFontScaling={false} style={styles.name} numberOfLines={2}>
            {name}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  container: {
    marginRight: '12@s',
  },
  cardWrapper: {
    // This wrapper applies the animation
  },
  card: {
    width: '140@s',
    height: '160@vs',
    backgroundColor: '#FFFFFF',
    borderRadius: '16@ms',
    padding: '12@s',
    alignItems: 'center',
    justifyContent: 'center',
    // 3D shadow effects
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    // Additional depth with border
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logoContainer: {
    width: '90@s',
    height: '90@vs',
    borderRadius: '12@ms',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8@vs',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
});

export default SponsoredRestaurantCard;

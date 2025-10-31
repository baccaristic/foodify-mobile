import React, { memo, useEffect } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonPulseProps {
  style?: StyleProp<ViewStyle>;
}

const SkeletonPulse: React.FC<SkeletonPulseProps> = ({ style }) => {
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0.6, { duration: 900 })
      ),
      -1,
      false
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.base, style, animatedStyle]} />;
};

export default memo(SkeletonPulse);

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
  },
});

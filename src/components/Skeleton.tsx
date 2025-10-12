import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleProp, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const SHIMMER_WIDTH = 180;

export default function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 12,
  style,
}: SkeletonProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [shimmerAnimation]);

  const translateX = useMemo(
    () =>
      shimmerAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-SHIMMER_WIDTH, SHIMMER_WIDTH],
      }),
    [shimmerAnimation]
  );

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: 'rgba(226, 232, 240, 0.8)',
        },
        style,
      ]}
    >
      <AnimatedGradient
        colors={[
          'rgba(148, 163, 184, 0)',
          'rgba(255, 255, 255, 0.7)',
          'rgba(148, 163, 184, 0)',
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          {
            position: 'absolute',
            width: SHIMMER_WIDTH,
            top: 0,
            bottom: 0,
          },
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

export const SkeletonCircle: React.FC<Pick<SkeletonProps, 'style' | 'width'>> = ({ width = 48, style }) => (
  <Skeleton width={width} height={typeof width === 'number' ? width : 48} borderRadius={9999} style={style} />
);

export const SkeletonText: React.FC<Pick<SkeletonProps, 'width' | 'style'>> = ({ width = '60%', style }) => (
  <Skeleton width={width} height={12} borderRadius={8} style={[{ marginVertical: 4 }, style]} />
);

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Bubble positions and configurations - arranged for visual appeal
const BUBBLES = [
  { id: 1, size: 100, startX: SCREEN_WIDTH * 0.2, startY: SCREEN_HEIGHT * 0.25 },
  { id: 2, size: 110, startX: SCREEN_WIDTH * 0.8, startY: SCREEN_HEIGHT * 0.2 },
  { id: 3, size: 105, startX: SCREEN_WIDTH * 0.5, startY: SCREEN_HEIGHT * 0.4 },
  { id: 4, size: 95, startX: SCREEN_WIDTH * 0.15, startY: SCREEN_HEIGHT * 0.5 },
  { id: 5, size: 115, startX: SCREEN_WIDTH * 0.75, startY: SCREEN_HEIGHT * 0.55 },
  { id: 6, size: 100, startX: SCREEN_WIDTH * 0.35, startY: SCREEN_HEIGHT * 0.7 },
  { id: 7, size: 90, startX: SCREEN_WIDTH * 0.65, startY: SCREEN_HEIGHT * 0.75 },
];

// Curved path waypoints for the bike to follow
const PATH_POINTS = [
  { x: -120, y: SCREEN_HEIGHT * 0.25 },
  { x: SCREEN_WIDTH * 0.15, y: SCREEN_HEIGHT * 0.3 },
  { x: SCREEN_WIDTH * 0.35, y: SCREEN_HEIGHT * 0.42 },
  { x: SCREEN_WIDTH * 0.55, y: SCREEN_HEIGHT * 0.5 },
  { x: SCREEN_WIDTH * 0.75, y: SCREEN_HEIGHT * 0.58 },
  { x: SCREEN_WIDTH + 120, y: SCREEN_HEIGHT * 0.65 },
];

const Bubble = ({
  size,
  startX,
  startY,
  delay,
}: {
  size: number;
  startX: number;
  startY: number;
  delay: number;
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Pop-in animation with bounce
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.2, {
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
        }),
        withTiming(1, {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        })
      )
    );

    // Fade in with pulsing effect
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 400 }),
        withRepeat(
          withSequence(
            withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        )
      )
    );

    // Gentle floating animation
    translateY.value = withDelay(
      delay + 400,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
          withTiming(20, { duration: 2800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    // Subtle rotation
    rotate.value = withDelay(
      delay + 400,
      withRepeat(
        withSequence(
          withTiming(5, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-5, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, [delay, scale, opacity, translateY, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: startX - size / 2,
          top: startY - size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

const DottedPath = () => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Memoize dot positions to avoid recalculating on every render
  const dots = React.useMemo(() => {
    const result: Array<{ key: string; left: number; top: number }> = [];

    PATH_POINTS.forEach((point, index) => {
      if (index === PATH_POINTS.length - 1) return;

      const nextPoint = PATH_POINTS[index + 1];
      const segmentLength = Math.sqrt(
        Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
      );
      const numDots = Math.floor(segmentLength / 18);

      for (let dotIndex = 0; dotIndex < numDots; dotIndex++) {
        const progress = dotIndex / numDots;
        const x = point.x + (nextPoint.x - point.x) * progress;
        const y = point.y + (nextPoint.y - point.y) * progress;

        result.push({
          key: `${index}-${dotIndex}`,
          left: x,
          top: y,
        });
      }
    });

    return result;
  }, []);

  return (
    <Animated.View style={[styles.pathContainer, animatedStyle]}>
      {dots.map((dot) => (
        <View key={dot.key} style={[styles.dot, { left: dot.left, top: dot.top }]} />
      ))}
    </Animated.View>
  );
};

const BikeAnimation = () => {
  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Animate through the path with repeat
    progress.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }), // Reset to start
        withTiming(1, {
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
        }),
        withDelay(1500, withTiming(1, { duration: 0 })) // Pause at end before restart
      ),
      -1, // Infinite repeat
      false
    );

    // Slight tilt animation for realism
    rotation.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(-2, { duration: 300, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [progress, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate position along the path
    const totalSegments = PATH_POINTS.length - 1;
    const currentSegment = Math.min(Math.floor(progress.value * totalSegments), totalSegments - 1);
    const segmentProgress = (progress.value * totalSegments) % 1;

    const startPoint = PATH_POINTS[currentSegment];
    const endPoint = PATH_POINTS[currentSegment + 1];

    const x = interpolate(segmentProgress, [0, 1], [startPoint.x, endPoint.x]);
    const y = interpolate(segmentProgress, [0, 1], [startPoint.y, endPoint.y]);

    return {
      transform: [{ translateX: x }, { translateY: y }, { rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={[styles.bikeContainer, animatedStyle]}>
      <Image
        source={require('../../assets/delivery.png')}
        style={styles.bikeImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

export default function LandingScreen({ onComplete }: { onComplete?: () => void }) {
  const navigation = useNavigation();

  useEffect(() => {
    // Navigate to Home after animation completes one full cycle
    const timer = setTimeout(() => {
      onComplete?.();
      navigation.navigate('Home' as never);
    }, 5500);

    return () => clearTimeout(timer);
  }, [navigation, onComplete]);

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background} />

      {/* Dotted path */}
      <DottedPath />

      {/* Animated bubbles - appear as bike passes by */}
      {BUBBLES.map((bubble, index) => (
        <Bubble
          key={bubble.id}
          size={bubble.size}
          startX={bubble.startX}
          startY={bubble.startY}
          delay={600 + index * 400}
        />
      ))}

      {/* Bike animation */}
      <BikeAnimation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F0EF',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F2F0EF',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  pathContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  dot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#CA251B',
    opacity: 0.5,
  },
  bikeContainer: {
    position: 'absolute',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bikeImage: {
    width: 70,
    height: 70,
  },
});

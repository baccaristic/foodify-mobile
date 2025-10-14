import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOngoingOrderContext } from '~/context/OngoingOrderContext';

const accentColor = '#D83A2E';
const softSurface = '#FFFFFF';
const textPrimary = '#0F172A';
const textSecondary = '#6B7280';

const screenHeight = Dimensions.get('window').height;

const DeliveredCelebrationOverlay = () => {
  const { deliveredCelebration, dismissDeliveredCelebration } = useOngoingOrderContext();
  const [isVisible, setIsVisible] = useState(false);
  const [activeCelebration, setActiveCelebration] = useState(deliveredCelebration);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslate = useRef(new Animated.Value(1)).current;
  const isAnimatingOutRef = useRef(false);

  const sheetPadding = useMemo(() => ({ paddingBottom: insets.bottom + 32 }), [insets.bottom]);

  const dimOpacity = useMemo(
    () =>
      backdropOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.45],
      }),
    [backdropOpacity],
  );

  const sheetOffset = useMemo(
    () =>
      sheetTranslate.interpolate({
        inputRange: [0, 1],
        outputRange: [0, screenHeight],
        extrapolate: 'clamp',
      }),
    [sheetTranslate],
  );

  const animateIn = useCallback(() => {
    backdropOpacity.stopAnimation();
    sheetTranslate.stopAnimation();
    backdropOpacity.setValue(0);
    sheetTranslate.setValue(1);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslate, {
        toValue: 0,
        damping: 16,
        mass: 0.9,
        stiffness: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, sheetTranslate]);

  const finalizeHide = useCallback(
    (acknowledge: boolean, navigateHome: boolean) => {
      isAnimatingOutRef.current = false;
      setIsVisible(false);
      setActiveCelebration(null);
      backdropOpacity.setValue(0);
      sheetTranslate.setValue(1);

      if (acknowledge) {
        dismissDeliveredCelebration();
      }

      if (navigateHome) {
        navigation.navigate('Home' as never);
      }
    },
    [backdropOpacity, dismissDeliveredCelebration, navigation, sheetTranslate],
  );

  const hideOverlay = useCallback(
    (options?: { animate?: boolean; acknowledge?: boolean; navigateHome?: boolean }) => {
      const { animate = true, acknowledge = true, navigateHome = true } = options ?? {};

      if (!isVisible || isAnimatingOutRef.current) {
        if (acknowledge) {
          dismissDeliveredCelebration();
        }
        return;
      }

      const finish = () => finalizeHide(acknowledge, navigateHome);

      if (!animate) {
        finish();
        return;
      }

      isAnimatingOutRef.current = true;

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslate, {
          toValue: 1,
          duration: 260,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        finish();
      });
    },
    [backdropOpacity, dismissDeliveredCelebration, finalizeHide, isVisible, sheetTranslate],
  );

  useEffect(() => {
    if (!deliveredCelebration) {
      return;
    }

    setActiveCelebration(deliveredCelebration);
    setIsVisible(true);
  }, [deliveredCelebration]);

  useEffect(() => {
    if (!isVisible || !activeCelebration) {
      return;
    }

    animateIn();
  }, [activeCelebration, animateIn, isVisible]);

  useEffect(() => {
    if (!deliveredCelebration && isVisible && !isAnimatingOutRef.current) {
      hideOverlay({ animate: true, acknowledge: false, navigateHome: false });
    }
  }, [deliveredCelebration, hideOverlay, isVisible]);

  if (!isVisible || !activeCelebration) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFillObject}>
      <View style={styles.overlayContainer}>
        <Animated.View pointerEvents="none" style={[styles.dim, { opacity: dimOpacity }]} />
        <Animated.View
          style={[styles.sheet, sheetPadding, { transform: [{ translateY: sheetOffset }] }]}
        >
          <LottieView
            source={require('../../assets/animations/delivered.json')}
            autoPlay
            loop={true}
            style={styles.animation}
          />
          <Text style={styles.heading}>Enjoy your food</Text>
          <Text style={styles.message}>Your delivery has arrived. Bon appétit!</Text>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.9}
            onPress={() => hideOverlay()}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  sheet: {
    width: '100%',
    backgroundColor: softSurface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 32,
    paddingTop: 40,
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
  heading: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
    color: textPrimary,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    color: textSecondary,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  button: {
    marginTop: 24,
    width: '100%',
    borderRadius: 999,
    backgroundColor: accentColor,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DeliveredCelebrationOverlay;

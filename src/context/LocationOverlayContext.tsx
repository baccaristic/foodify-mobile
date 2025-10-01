import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import LocationSelectionScreen from '~/screens/LocationSelectionScreen';

interface LocationOverlayContextValue {
  open: () => void;
  close: () => void;
}

const LocationOverlayContext = createContext<LocationOverlayContextValue | undefined>(undefined);

const screenHeight = Dimensions.get('screen').height;

export const LocationOverlayProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const translateY = useSharedValue(screenHeight);

  const open = useCallback(() => {
    translateY.value = screenHeight;
    setIsMounted(true);
    setIsOpen(true);
  }, [translateY]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      translateY.value = screenHeight;
      return;
    }

    if (isOpen) {
      translateY.value = withTiming(0, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      translateY.value = withTiming(
        screenHeight,
        {
          duration: 240,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(setIsMounted)(false);
          }
        },
      );
    }
  }, [isMounted, isOpen, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const value = useMemo<LocationOverlayContextValue>(
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  return (
    <LocationOverlayContext.Provider value={value}>
      {children}

      <Modal
        transparent
        animationType="none"
        visible={isMounted}
        statusBarTranslucent
        onRequestClose={close}
      >
        <View style={styles.overlayRoot}>
          <Pressable style={styles.backdrop} onPress={close} />
          <Animated.View style={[styles.sheetContainer, sheetStyle]}>
            <LocationSelectionScreen onClose={close} />
          </Animated.View>
        </View>
      </Modal>
    </LocationOverlayContext.Provider>
  );
};

export const useLocationOverlayContext = () => {
  const context = useContext(LocationOverlayContext);
  if (!context) {
    throw new Error('useLocationOverlayContext must be used within a LocationOverlayProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  overlayRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    width: '100%',
    minHeight: screenHeight,
    maxHeight: screenHeight,
    backgroundColor: '#17213A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
});

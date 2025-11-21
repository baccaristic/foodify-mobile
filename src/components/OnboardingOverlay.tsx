import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { X, ArrowRight } from 'lucide-react-native';
import { useOnboarding, OnboardingStep } from '~/context/OnboardingContext';
import { useTranslation } from '~/localization';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingOverlayProps {
  step: OnboardingStep;
  targetRef?: React.RefObject<View>;
  title: string;
  description: string;
  onNext: () => void;
  onSkip: () => void;
  highlightArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  step,
  title,
  description,
  onNext,
  onSkip,
  highlightArea,
}) => {
  const { currentStep } = useOnboarding();
  const { t } = useTranslation();

  if (currentStep !== step) {
    return null;
  }

  const tooltipTop = highlightArea
    ? highlightArea.y + highlightArea.height + 20
    : SCREEN_HEIGHT / 2;
  const shouldPositionBelow = tooltipTop < SCREEN_HEIGHT * 0.7;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <View style={StyleSheet.absoluteFill}>
        {/* Full screen blur overlay */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
        </View>

        {/* Dark overlay with spotlight cutout */}
        {highlightArea && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Top section */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: highlightArea.y,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }}
            />
            {/* Left section */}
            <View
              style={{
                position: 'absolute',
                top: highlightArea.y,
                left: 0,
                width: highlightArea.x,
                height: highlightArea.height,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }}
            />
            {/* Right section */}
            <View
              style={{
                position: 'absolute',
                top: highlightArea.y,
                left: highlightArea.x + highlightArea.width,
                right: 0,
                height: highlightArea.height,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }}
            />
            {/* Bottom section */}
            <View
              style={{
                position: 'absolute',
                top: highlightArea.y + highlightArea.height,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }}
            />

            {/* Highlight border */}
            <View
              style={{
                position: 'absolute',
                top: highlightArea.y - 4,
                left: highlightArea.x - 4,
                width: highlightArea.width + 8,
                height: highlightArea.height + 8,
                borderRadius: 12,
                borderWidth: 3,
                borderColor: '#CA251B',
                shadowColor: '#CA251B',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
              }}
            />
          </View>
        )}

        {/* Tooltip */}
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.tooltipContainer,
            shouldPositionBelow
              ? { top: tooltipTop }
              : { bottom: SCREEN_HEIGHT - (highlightArea?.y ?? SCREEN_HEIGHT / 2) + 20 },
          ]}>
          <View style={styles.tooltip}>
            <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipTitle}>{title}</Text>
              <TouchableOpacity onPress={onSkip} style={styles.closeButton}>
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.tooltipDescription}>{description}</Text>
            <TouchableOpacity style={styles.nextButton} onPress={onNext}>
              <Text style={styles.nextButtonText}>{t('common.next')}</Text>
              <ArrowRight size={18} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  tooltip: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tooltipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#17213A',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  tooltipDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  nextButton: {
    backgroundColor: '#CA251B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingOverlay;

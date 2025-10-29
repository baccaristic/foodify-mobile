import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ChevronDown, Info, Sparkles } from 'lucide-react-native';
import WheelOfFortune, {
  type WheelOfFortuneRef,
  type WheelOfFortuneReward,
} from '@fidme/react-native-wheel-of-fortune';
import { LinearGradient } from 'expo-linear-gradient';

import { useTranslation } from '~/localization';

const palette = {
  accent: '#CA251B',
  accentDark: '#17213A',
  text: '#111827',
  neutral: '#6B7280',
  surface: '#FFFFFF',
  backdrop: 'rgba(23, 33, 58, 0.55)',
  slices: {
    orange: '#F97316',
    violet: '#7C3AED',
    teal: '#0EA5E9',
    pink: '#F472B6',
    green: '#22C55E',
    yellow: '#FACC15',
    blue: '#3B82F6',
    coral: '#FB7185',
  },
};

type LuckyWheelSlice = {
  id: string;
  label: string;
  wheelLabel: string;
  backgroundColor: string;
  textColor: string;
};

type LuckyWheelReward = LuckyWheelSlice;

const SPIN_DURATION_MS = 6000;
const STATIC_REWARD_INDEX = 0;

const LuckyWheelScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const wheelRef = useRef<WheelOfFortuneRef | null>(null);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState<LuckyWheelReward | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const slices = useMemo<LuckyWheelSlice[]>(
    () => {
      const createPercentSlice = (id: string, value: string, backgroundColor: string, textColor: string) => {
        const label = t('profile.luckyWheel.slices.percentOff', { values: { value } });
        return {
          id,
          label,
          wheelLabel: label.toUpperCase().replace('%', ' %'),
          backgroundColor,
          textColor,
        };
      };

      const createStaticSlice = (
        id: string,
        key: 'freeDelivery' | 'waitTime',
        backgroundColor: string,
        textColor: string,
      ) => {
        const translationKey =
          key === 'freeDelivery'
            ? 'profile.luckyWheel.slices.freeDelivery'
            : 'profile.luckyWheel.slices.waitTime';
        const label = t(translationKey);
        return {
          id,
          label,
          wheelLabel: label.toUpperCase(),
          backgroundColor,
          textColor,
        };
      };

      return [
        createPercentSlice('coupon-10', '10', palette.slices.orange, '#FFFFFF'),
        createStaticSlice('wait-time-1', 'waitTime', palette.slices.violet, '#FFFFFF'),
        createPercentSlice('coupon-20', '20', palette.slices.teal, '#FFFFFF'),
        createStaticSlice('wait-time-2', 'waitTime', palette.slices.pink, '#FFFFFF'),
        createPercentSlice('coupon-40', '40', palette.slices.green, '#FFFFFF'),
        createStaticSlice('free-delivery-1', 'freeDelivery', palette.slices.yellow, palette.accentDark),
        createPercentSlice('coupon-10-2', '10', palette.slices.blue, '#FFFFFF'),
        createStaticSlice('free-delivery-2', 'freeDelivery', palette.slices.coral, '#FFFFFF'),
      ];
    },
    [t],
  );

  const wheelLabels = useMemo(() => slices.map((slice) => slice.wheelLabel), [slices]);
  const wheelColors = useMemo(() => slices.map((slice) => slice.backgroundColor), [slices]);
  const wheelTextColors = useMemo(() => slices.map((slice) => slice.textColor), [slices]);

  const wheelOptions = useMemo(
    () => ({
      rewards: wheelLabels,
      rewardColors: wheelColors,
      rewardTextColors: wheelTextColors,
      textFontSize: 16,
      textFontWeight: '700',
      knobSize: 18,
      knobColor: palette.accentDark,
      borderWidth: 14,
      borderColor: '#F3F4F6',
      innerRadius: 78,
      spinDuration: SPIN_DURATION_MS,
      backgroundColor: palette.surface,
      textAngle: 'horizontal',
      enableUserInteraction: false,
      pointer: {
        size: 30,
        color: palette.accent,
        borderWidth: 4,
        borderColor: palette.surface,
      },
      center: {
        backgroundColor: palette.surface,
        borderColor: palette.accent,
        borderWidth: 6,
        text: t('profile.luckyWheel.wheelCenterTitle'),
        textColor: palette.accentDark,
        textFontSize: 16,
        textFontWeight: '700',
        subText: t('profile.luckyWheel.wheelCenterSubtitle'),
        subTextColor: palette.neutral,
        subTextFontSize: 10,
      },
    }),
    [wheelColors, wheelLabels, wheelTextColors, t],
  );

  const handleSpin = () => {
    if (isSpinning) {
      return;
    }

    const reward = slices[STATIC_REWARD_INDEX] ?? null;
    setSelectedReward(reward);
    setIsResultVisible(false);
    setIsSpinning(true);

    const hasSpinToReward = typeof wheelRef.current?.spinToReward === 'function';
    const hasSpin = typeof wheelRef.current?.spin === 'function';

    if (hasSpinToReward) {
      wheelRef.current?.spinToReward?.(STATIC_REWARD_INDEX);
    } else if (hasSpin) {
      wheelRef.current?.spin?.();
    }
  };

  const handleCloseModal = () => {
    setIsResultVisible(false);
    setIsSpinning(false);
  };

  const handleWinner = (_reward: WheelOfFortuneReward, index: number) => {
    const reward = slices[index] ?? selectedReward;
    setSelectedReward(reward ?? null);
    setIsSpinning(false);
    setIsResultVisible(true);
  };

  useEffect(() => {
    const hasImperativeSpin =
      typeof wheelRef.current?.spinToReward === 'function' || typeof wheelRef.current?.spin === 'function';

    if (!isSpinning || hasImperativeSpin) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setIsSpinning(false);
      setIsResultVisible(true);
    }, SPIN_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [isSpinning]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.heroBlock}>
          <LinearGradient
            colors={['#E93A2E', '#CA251B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          />
          <View style={styles.heroHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              style={styles.backButton}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.locationPill} activeOpacity={0.85}>
              <Text allowFontScaling={false} style={styles.locationLabel}>
                {t('profile.luckyWheel.location')}
              </Text>
              <ChevronDown size={16} color={palette.accent} />
            </TouchableOpacity>
          </View>

          <Text allowFontScaling={false} style={styles.tagline}>
            {t('profile.luckyWheel.header.tagline')}
          </Text>
          <Text allowFontScaling={false} style={styles.heroTitle}>
            {t('profile.luckyWheel.header.title')}
          </Text>
          <Text allowFontScaling={false} style={styles.heroSubtitle}>
            {t('profile.luckyWheel.header.subtitle')}
          </Text>

          <TouchableOpacity style={styles.helperButton} activeOpacity={0.9}>
            <Info size={16} color={palette.accent} style={styles.helperIcon} />
            <Text allowFontScaling={false} style={styles.helperLabel}>
              {t('profile.luckyWheel.header.helperCta')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.wheelCard}>
          <View style={styles.wheelCardHeader}>
            <Sparkles size={16} color={palette.accent} />
            <Text allowFontScaling={false} style={styles.wheelCardTitle}>
              {t('profile.luckyWheel.cardTitle')}
            </Text>
          </View>
          <View style={styles.wheelWrapper}>
            <WheelOfFortune
              options={wheelOptions}
              getWinner={handleWinner}
              onRef={(instance: WheelOfFortuneRef | null) => {
                wheelRef.current = instance;
              }}
            />
          </View>
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSpin}
            disabled={isSpinning}
          >
            <Text allowFontScaling={false} style={styles.spinButtonLabel}>
              {t('profile.luckyWheel.actions.spin')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal animationType="fade" transparent visible={isResultVisible} onRequestClose={handleCloseModal}>
        <Pressable style={styles.modalBackdrop} onPress={handleCloseModal}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <Text allowFontScaling={false} style={styles.modalTitle}>
              {t('profile.luckyWheel.modal.title')}
            </Text>
            <Text allowFontScaling={false} style={styles.modalHeadline}>
              {selectedReward?.label ?? t('profile.luckyWheel.modal.placeholderReward')}
            </Text>
            <Text allowFontScaling={false} style={styles.modalSubtitle}>
              {t('profile.luckyWheel.modal.subtitle')}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalActionButton, styles.modalPrimaryAction]} activeOpacity={0.85}>
                <Text allowFontScaling={false} style={[styles.modalActionLabel, styles.modalPrimaryActionLabel]}>
                  {t('profile.luckyWheel.modal.primaryAction')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalSecondaryAction]}
                activeOpacity={0.85}
                onPress={handleCloseModal}
              >
                <Text allowFontScaling={false} style={[styles.modalActionLabel, styles.modalSecondaryActionLabel]}>
                  {t('profile.luckyWheel.modal.secondaryAction')}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  container: {
    flex: 1,
  },
  heroBlock: {
    backgroundColor: palette.accent,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  locationLabel: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  tagline: {
    marginTop: 24,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  heroTitle: {
    marginTop: 4,
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroSubtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
  },
  helperButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  helperIcon: {
    marginRight: 6,
  },
  helperLabel: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  wheelCard: {
    marginTop: -48,
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 16,
    shadowColor: '#17213A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'center',
  },
  wheelWrapper: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 280,
  },
  wheelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wheelCardTitle: {
    color: palette.accentDark,
    fontSize: 16,
    fontWeight: '700',
  },
  ctaContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  spinButton: {
    backgroundColor: palette.accent,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#CA251B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: palette.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#17213A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 14,
  },
  modalTitle: {
    color: palette.accent,
    fontSize: 22,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  modalHeadline: {
    marginTop: 12,
    color: palette.accentDark,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalSubtitle: {
    marginTop: 8,
    color: palette.neutral,
    fontSize: 14,
    textAlign: 'center',
  },
  modalActions: {
    marginTop: 24,
    width: '100%',
    gap: 12,
  },
  modalActionButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalPrimaryAction: {
    backgroundColor: palette.accent,
  },
  modalPrimaryActionLabel: {
    color: '#FFFFFF',
  },
  modalSecondaryAction: {
    borderWidth: 1,
    borderColor: palette.accent,
    backgroundColor: '#FFFFFF',
  },
  modalActionLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalSecondaryActionLabel: {
    color: palette.accent,
  },
});

export default LuckyWheelScreen;

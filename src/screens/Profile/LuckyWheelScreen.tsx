import React, { useMemo, useRef, useState } from 'react';
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
import WheelOfFortune, { type WheelOfFortuneRef } from '@fidme/react-native-wheel-of-fortune';

import { useTranslation } from '~/localization';

const palette = {
  accent: '#CA251B',
  accentDark: '#17213A',
  text: '#111827',
  neutral: '#6B7280',
  surface: '#FFFFFF',
  backdrop: 'rgba(23, 33, 58, 0.55)',
};

type LuckyWheelSlice = {
  id: string;
  label: string;
  subLabel?: string;
  backgroundColor: string;
  textColor: string;
};

type LuckyWheelReward = LuckyWheelSlice;

const LuckyWheelScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const wheelRef = useRef<WheelOfFortuneRef | null>(null);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState<LuckyWheelReward | null>(null);

  const slices = useMemo<LuckyWheelSlice[]>(
    () => [
      {
        id: 'coupon-10',
        label: t('profile.luckyWheel.slices.percentOff', { values: { value: '10' } }),
        backgroundColor: '#CA251B',
        textColor: '#FFFFFF',
      },
      {
        id: 'try-again-1',
        label: t('profile.luckyWheel.slices.tryAgain'),
        backgroundColor: '#FDE7E5',
        textColor: palette.accent,
      },
      {
        id: 'coupon-20',
        label: t('profile.luckyWheel.slices.percentOff', { values: { value: '20' } }),
        backgroundColor: '#F6F7FB',
        textColor: palette.accentDark,
      },
      {
        id: 'free-delivery-1',
        label: t('profile.luckyWheel.slices.freeDelivery'),
        backgroundColor: '#CA251B',
        textColor: '#FFFFFF',
      },
      {
        id: 'coupon-40',
        label: t('profile.luckyWheel.slices.percentOff', { values: { value: '40' } }),
        backgroundColor: '#FDE7E5',
        textColor: palette.accent,
      },
      {
        id: 'try-again-2',
        label: t('profile.luckyWheel.slices.tryAgain'),
        backgroundColor: '#F6F7FB',
        textColor: palette.accentDark,
      },
      {
        id: 'free-delivery-2',
        label: t('profile.luckyWheel.slices.freeDelivery'),
        backgroundColor: '#CA251B',
        textColor: '#FFFFFF',
      },
      {
        id: 'coupon-10-2',
        label: t('profile.luckyWheel.slices.percentOff', { values: { value: '10' } }),
        backgroundColor: '#FDE7E5',
        textColor: palette.accent,
      },
    ],
    [t],
  );

  const wheelOptions = useMemo(
    () => ({
      rewards: slices.map((slice) => ({
        value: slice.id,
        label: slice.label,
        style: {
          backgroundColor: slice.backgroundColor,
          textColor: slice.textColor,
          labelFontSize: 16,
          labelFontWeight: '700',
          labelRadiusOffset: 36,
          textAlign: 'center',
        },
      })),
      knobSize: 18,
      knobColor: palette.accentDark,
      borderWidth: 14,
      borderColor: '#F3F4F6',
      innerRadius: 78,
      spinDuration: 6000,
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
    [slices, t],
  );

  const handleSpin = () => {
    const reward = slices[0];
    setSelectedReward(reward);
    setIsResultVisible(true);

    if (wheelRef.current?.spinToReward) {
      wheelRef.current.spinToReward(0);
    } else if (wheelRef.current?.spin) {
      wheelRef.current.spin();
    }
  };

  const handleCloseModal = () => {
    setIsResultVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.heroBlock}>
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
          <WheelOfFortune
            ref={(instance) => {
              wheelRef.current = instance;
            }}
            options={wheelOptions}
          />
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.spinButton} activeOpacity={0.85} onPress={handleSpin}>
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

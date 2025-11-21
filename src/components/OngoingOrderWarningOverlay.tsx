import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { AlertCircle, Package } from 'lucide-react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTranslation } from '~/localization';

type OngoingOrderWarningOverlayProps = {
  visible: boolean;
  onViewOrder: () => void;
  onDismiss: () => void;
};

const accentColor = '#CA251B';
const sectionTitleColor = '#17213A';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const OVERLAY_HEIGHT = SCREEN_HEIGHT / 4;

const OngoingOrderWarningOverlay: React.FC<OngoingOrderWarningOverlayProps> = ({
  visible,
  onViewOrder,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(OVERLAY_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: OVERLAY_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!visible) {
    return null;
  }

  return (
    <Modal animationType="none" transparent visible={visible} onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <AlertCircle size={moderateScale(28)} color={accentColor} />
                </View>
              </View>

              {/* Title */}
              <Text allowFontScaling={false} style={styles.title}>
                {t('ongoingOrderWarning.title')}
              </Text>

              {/* Description */}
              <Text allowFontScaling={false} style={styles.description}>
                {t('ongoingOrderWarning.description')}
              </Text>

              {/* Info Card */}
              <View style={styles.infoSection}>
                <View style={styles.infoCard}>
                  <Package size={moderateScale(16)} color={accentColor} />
                  <Text allowFontScaling={false} style={styles.infoText}>
                    {t('ongoingOrderWarning.info')}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onViewOrder}
                  style={[styles.button, styles.primaryButton]}>
                  <Text allowFontScaling={false} style={styles.primaryButtonText}>
                    {t('ongoingOrderWarning.viewOrder')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onDismiss}
                  style={[styles.button, styles.secondaryButton]}>
                  <Text allowFontScaling={false} style={styles.secondaryButtonText}>
                    {t('ongoingOrderWarning.dismiss')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 33, 58, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingVertical: moderateScale(28),
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(36),
    shadowColor: '#17213A',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: moderateScale(16),
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  iconCircle: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: '#FFF5F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDE7E5',
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: sectionTitleColor,
    textAlign: 'center',
    marginBottom: moderateScale(10),
  },
  description: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: moderateScale(20),
  },
  infoSection: {
    marginBottom: moderateScale(20),
  },
  infoCard: {
    backgroundColor: '#FFF5F4',
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE7E5',
  },
  infoText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: sectionTitleColor,
    marginLeft: moderateScale(10),
    flex: 1,
  },
  buttonContainer: {
    gap: moderateScale(10),
  },
  button: {
    borderRadius: moderateScale(14),
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: accentColor,
  },
  primaryButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F1F2F4',
  },
  secondaryButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default OngoingOrderWarningOverlay;

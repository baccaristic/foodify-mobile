import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { AlertTriangle, MapPin, Navigation } from 'lucide-react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTranslation } from '~/localization';

type AddressMismatchOverlayProps = {
  visible: boolean;
  selectedAddress: string;
  currentLocationAddress?: string;
  onContinueWithSelected: () => void;
  onUpdateToCurrentLocation: () => void;
  onCancel: () => void;
};

const accentColor = '#CA251B';
const sectionTitleColor = '#17213A';
const borderColor = '#E8E9EC';

const AddressMismatchOverlay: React.FC<AddressMismatchOverlayProps> = ({
  visible,
  selectedAddress,
  currentLocationAddress,
  onContinueWithSelected,
  onUpdateToCurrentLocation,
  onCancel,
}) => {
  const { t } = useTranslation();
  const handleBackdropPress = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        
        <View style={styles.container}>
          {/* Warning Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={moderateScale(32)} color={accentColor} />
            </View>
          </View>

          {/* Title */}
          <Text allowFontScaling={false} style={styles.title}>
            {t('addressMismatch.title')}
          </Text>

          {/* Description */}
          <Text allowFontScaling={false} style={styles.description}>
            {t('addressMismatch.description')}
          </Text>

          {/* Address Cards */}
          <View style={styles.addressSection}>
            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <MapPin size={moderateScale(16)} color="#6B7280" />
                <Text allowFontScaling={false} style={styles.addressLabel}>
                  {t('addressMismatch.selectedAddress')}
                </Text>
              </View>
              <Text allowFontScaling={false} style={styles.addressText} numberOfLines={2}>
                {selectedAddress}
              </Text>
            </View>

            {currentLocationAddress && (
              <View style={[styles.addressCard, styles.currentLocationCard]}>
                <View style={styles.addressHeader}>
                  <Navigation size={moderateScale(16)} color={accentColor} />
                  <Text allowFontScaling={false} style={[styles.addressLabel, styles.currentLocationLabel]}>
                    {t('addressMismatch.currentGpsLocation')}
                  </Text>
                </View>
                <Text allowFontScaling={false} style={styles.addressText} numberOfLines={2}>
                  {currentLocationAddress}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onContinueWithSelected}
              style={[styles.button, styles.primaryButton]}
            >
              <Text allowFontScaling={false} style={styles.primaryButtonText}>
                {t('addressMismatch.continueWithSelected')}
              </Text>
            </TouchableOpacity>

            {currentLocationAddress && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onUpdateToCurrentLocation}
                style={[styles.button, styles.secondaryButton]}
              >
                <Text allowFontScaling={false} style={styles.secondaryButtonText}>
                  {t('addressMismatch.useCurrentLocation')}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onCancel}
              style={[styles.button, styles.tertiaryButton]}
            >
              <Text allowFontScaling={false} style={styles.tertiaryButtonText}>
                {t('addressMismatch.cancelOrder')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 33, 58, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    paddingVertical: moderateScale(28),
    paddingHorizontal: moderateScale(24),
    width: '100%',
    maxWidth: 480,
    shadowColor: '#17213A',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: moderateScale(16),
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: moderateScale(20),
  },
  iconCircle: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    backgroundColor: '#FFF5F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDE7E5',
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: sectionTitleColor,
    textAlign: 'center',
    marginBottom: moderateScale(12),
  },
  description: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: moderateScale(24),
  },
  addressSection: {
    marginBottom: moderateScale(24),
  },
  addressCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: borderColor,
    marginBottom: moderateScale(12),
  },
  currentLocationCard: {
    backgroundColor: '#FFF5F4',
    borderColor: '#FDE7E5',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  addressLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: moderateScale(6),
  },
  currentLocationLabel: {
    color: accentColor,
  },
  addressText: {
    fontSize: moderateScale(14),
    color: sectionTitleColor,
    lineHeight: moderateScale(20),
  },
  buttonContainer: {
    gap: moderateScale(12),
  },
  button: {
    borderRadius: moderateScale(16),
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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: accentColor,
  },
  secondaryButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: accentColor,
  },
  tertiaryButton: {
    backgroundColor: '#F1F2F4',
  },
  tertiaryButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default AddressMismatchOverlay;

import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, Image } from 'react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { X } from 'lucide-react-native';
import type { DeliveryNetworkStatus } from '~/interfaces/DeliveryStatus';
import { useTranslation } from '~/localization';

interface SystemStatusOverlayProps {
  visible: boolean;
  status: DeliveryNetworkStatus;
  message?: string | null;
  onRequestClose?: () => void;
}

const SystemStatusOverlay: React.FC<SystemStatusOverlayProps> = ({
  visible,
  status,
  message,
  onRequestClose,
}) => {
  const { t } = useTranslation();

  const statusTitle = useMemo(() => {
    switch (status) {
      case 'AVAILABLE':
        return t('systemStatus.titles.available');
      case 'BUSY':
        return t('systemStatus.titles.busy');
      case 'NO_DRIVERS_AVAILABLE':
        return t('systemStatus.titles.noDriversAvailable');
      default:
        return t('systemStatus.titles.available');
    }
  }, [status, t]);

  const subtitle = useMemo(() => {
    if (message && message.trim().length > 0) {
      return message;
    }

    switch (status) {
      case 'BUSY':
        return t('systemStatus.messages.busy');
      case 'NO_DRIVERS_AVAILABLE':
        return t('systemStatus.messages.noDriversAvailable');
      default:
        return '';
    }
  }, [message, status, t]);

  const { primaryMessage, emphasisMessage } = useMemo(() => {
    if (!subtitle) {
      return { primaryMessage: '', emphasisMessage: '' };
    }

    const trimmed = subtitle.trim();
    const emphasisSentence = t('systemStatus.appreciatePatience');

    if (trimmed.includes(emphasisSentence)) {
      const primary = trimmed.replace(emphasisSentence, '').trim();
      return {
        primaryMessage: primary,
        emphasisMessage: emphasisSentence,
      };
    }

    return { primaryMessage: trimmed, emphasisMessage: '' };
  }, [subtitle, t]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose ?? (() => undefined)}
      statusBarTranslucent>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.scrim}
          activeOpacity={1}
          onPress={onRequestClose ?? (() => undefined)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss system status overlay"
        />
        <View style={styles.card}>
          <View style={styles.closeButtonWrapper}>
            <TouchableOpacity
              onPress={onRequestClose ?? (() => undefined)}
              accessibilityRole="button"
              accessibilityLabel="Close system status overlay"
              style={styles.closeButton}>
              <X size={s(18)} color="#0F172A" />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text allowFontScaling={false} style={styles.title}>
              {statusTitle}
            </Text>
            {primaryMessage ? (
              <Text allowFontScaling={false} style={styles.subtitle}>
                {primaryMessage}
              </Text>
            ) : null}
            {emphasisMessage ? (
              <Text allowFontScaling={false} style={styles.emphasis}>
                {emphasisMessage}
              </Text>
            ) : null}
            <Image
              source={require('../../assets/system-info.png')}
              style={styles.illustration}
              resizeMode="contain"
              accessible
              accessibilityIgnoresInvertColors
              accessibilityLabel="Illustration of delivery riders"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  scrim: {
    flex: 1,
  },
  card: {
    width: '100%',
    height: '50%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: s(24),
    borderTopRightRadius: s(24),
    paddingVertical: vs(24),
    paddingHorizontal: s(24),
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: s(20),
    fontWeight: '700',
    color: '#D92D20',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: s(14),
    lineHeight: vs(20),
    color: '#0F172A',
    textAlign: 'center',
  },
  closeButtonWrapper: {
    width: '100%',
    alignItems: 'flex-end',
  },
  closeButton: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: vs(12),
  },
  emphasis: {
    fontSize: s(14),
    lineHeight: vs(20),
    color: '#0F172A',
    fontWeight: '700',
    textAlign: 'center',
  },
  illustration: {
    marginTop: vs(12),
    width: '100%',
    height: vs(160),
  },
});

export default SystemStatusOverlay;

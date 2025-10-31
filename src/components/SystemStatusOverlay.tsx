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
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  titleOverride?: string;
  subtitleOverride?: string;
}

const STATUS_TITLE_KEYS: Record<DeliveryNetworkStatus, string> = {
  AVAILABLE: 'common.systemStatusOverlay.titles.available',
  BUSY: 'common.systemStatusOverlay.titles.busy',
  NO_DRIVERS_AVAILABLE: 'common.systemStatusOverlay.titles.unavailable',
};

const STATUS_MESSAGE_KEYS: Partial<Record<DeliveryNetworkStatus, string>> = {
  BUSY: 'common.systemStatusOverlay.messages.busy',
  NO_DRIVERS_AVAILABLE: 'common.systemStatusOverlay.messages.unavailable',
};

const SystemStatusOverlay: React.FC<SystemStatusOverlayProps> = ({
  visible,
  status,
  message,
  onRequestClose,
  primaryActionLabel,
  onPrimaryAction,
  titleOverride,
  subtitleOverride,
}) => {
  const { t } = useTranslation();

  const subtitle = useMemo(() => {
    if (subtitleOverride) {
      return subtitleOverride;
    }

    if (message && message.trim().length > 0) {
      return message;
    }

    const fallbackKey = STATUS_MESSAGE_KEYS[status];

    return fallbackKey ? t(fallbackKey) : '';
  }, [message, status, subtitleOverride, t]);

  const title = useMemo(() => {
    if (titleOverride) {
      return titleOverride;
    }

    return t(STATUS_TITLE_KEYS[status]);
  }, [status, t, titleOverride]);

  const { primaryMessage, emphasisMessage } = useMemo(() => {
    if (!subtitle) {
      return { primaryMessage: '', emphasisMessage: '' };
    }

    const trimmed = subtitle.trim();
    const emphasisSentence = 'We appreciate your patience.';

    if (trimmed.includes(emphasisSentence)) {
      const primary = trimmed.replace(emphasisSentence, '').trim();
      return {
        primaryMessage: primary,
        emphasisMessage: emphasisSentence,
      };
    }

    return { primaryMessage: trimmed, emphasisMessage: '' };
  }, [subtitle]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose ?? (() => undefined)}
      statusBarTranslucent
    >
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
              style={styles.closeButton}
            >
              <X size={s(18)} color="#0F172A" />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text allowFontScaling={false} style={styles.title}>
              {title}
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
            {primaryActionLabel && onPrimaryAction ? (
              <TouchableOpacity
                onPress={onPrimaryAction}
                style={styles.primaryActionButton}
                accessibilityRole="button"
                accessibilityLabel={primaryActionLabel}
              >
                <Text allowFontScaling={false} style={styles.primaryActionLabel}>
                  {primaryActionLabel}
                </Text>
              </TouchableOpacity>
            ) : null}
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
  primaryActionButton: {
    marginTop: vs(8),
    paddingVertical: vs(12),
    paddingHorizontal: s(32),
    borderRadius: s(20),
    backgroundColor: '#CA251B',
  },
  primaryActionLabel: {
    fontSize: s(14),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default SystemStatusOverlay;

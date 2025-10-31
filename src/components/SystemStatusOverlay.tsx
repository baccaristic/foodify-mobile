import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { X } from 'lucide-react-native';
import type { DeliveryNetworkStatus } from '~/interfaces/DeliveryStatus';

interface SystemStatusOverlayProps {
  visible: boolean;
  status: DeliveryNetworkStatus;
  message?: string | null;
  onRequestClose?: () => void;
}

const STATUS_TITLES: Record<DeliveryNetworkStatus, string> = {
  AVAILABLE: 'Deliveries are running smoothly',
  BUSY: 'Riders are busy right now',
  NO_DRIVERS_AVAILABLE: 'No drivers available',
};

const STATUS_MESSAGES: Partial<Record<DeliveryNetworkStatus, string>> = {
  BUSY:
    'You can still place your order, but delivery times may be longer than usual. We appreciate your patience.',
  NO_DRIVERS_AVAILABLE:
    "We're temporarily unable to accept new delivery orders. Please check back again in a little while.",
};

const SystemStatusOverlay: React.FC<SystemStatusOverlayProps> = ({
  visible,
  status,
  message,
  onRequestClose,
}) => {
  const subtitle = useMemo(() => {
    if (message && message.trim().length > 0) {
      return message;
    }

    return STATUS_MESSAGES[status] ?? '';
  }, [message, status]);

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
          <Text allowFontScaling={false} style={styles.title}>
            {STATUS_TITLES[status]}
          </Text>
          {subtitle ? (
            <Text allowFontScaling={false} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
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
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: vs(12),
  },
  title: {
    fontSize: s(20),
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: s(14),
    lineHeight: vs(20),
    color: '#475569',
    textAlign: 'left',
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
});

export default SystemStatusOverlay;

import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ScaledSheet, moderateScale, s, vs } from 'react-native-size-matters';
import type { DeliveryNetworkStatus } from '~/interfaces/DeliveryStatus';

interface SystemStatusOverlayProps {
  visible: boolean;
  status: DeliveryNetworkStatus;
  message?: string | null;
  availableDrivers?: number;
  waitingForAssignment?: number;
  awaitingDriverResponse?: number;
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
  availableDrivers,
  waitingForAssignment,
  awaitingDriverResponse,
  onRequestClose,
}) => {
  const subtitle = useMemo(() => {
    if (message && message.trim().length > 0) {
      return message;
    }

    return STATUS_MESSAGES[status] ?? '';
  }, [message, status]);

  const shouldShowMetrics =
    typeof availableDrivers === 'number' ||
    typeof waitingForAssignment === 'number' ||
    typeof awaitingDriverResponse === 'number';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose ?? (() => undefined)}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Image
            source={require('../../assets/system-info.png')}
            style={styles.image}
            contentFit="contain"
          />
          <Text allowFontScaling={false} style={styles.title}>
            {STATUS_TITLES[status]}
          </Text>
          {subtitle ? (
            <Text allowFontScaling={false} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
          {shouldShowMetrics ? (
            <View style={styles.metricsWrapper}>
              {typeof availableDrivers === 'number' ? (
                <Text allowFontScaling={false} style={styles.metricText}>
                  {`Available drivers: ${availableDrivers}`}
                </Text>
              ) : null}
              {typeof waitingForAssignment === 'number' ? (
                <Text allowFontScaling={false} style={styles.metricText}>
                  {`Waiting for assignment: ${waitingForAssignment}`}
                </Text>
              ) : null}
              {typeof awaitingDriverResponse === 'number' ? (
                <Text allowFontScaling={false} style={styles.metricText}>
                  {`Awaiting driver response: ${awaitingDriverResponse}`}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: s(24),
  },
  card: {
    width: "100%",
    maxWidth: moderateScale(360),
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    paddingVertical: vs(24),
    paddingHorizontal: s(24),
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  image: {
    width: moderateScale(180),
    height: moderateScale(140),
    marginBottom: vs(20),
  },
  title: {
    fontSize: s(20),
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: vs(12),
  },
  subtitle: {
    fontSize: s(14),
    lineHeight: vs(20),
    color: "#475569",
    textAlign: "center",
  },
  metricsWrapper: {
    marginTop: vs(18),
    width: "100%",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
    paddingTop: vs(16),
    gap: vs(8),
  },
  metricText: {
    fontSize: s(13),
    lineHeight: vs(18),
    color: "#1E293B",
    textAlign: "center",
  },
});

export default SystemStatusOverlay;

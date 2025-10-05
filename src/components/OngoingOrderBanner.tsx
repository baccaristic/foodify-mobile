import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bike, ChevronUp, Clock } from 'lucide-react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import useAuth from '~/hooks/useAuth';
import useOngoingOrder from '~/hooks/useOngoingOrder';
import useOngoingOrderBannerStore from '~/store/ongoingOrderBanner';

const backgroundColor = '#17213A';
const accentColor = '#CA251B';
const textColor = '#FFFFFF';
const mutedTextColor = '#E2E8F0';

const formatStatusLabel = (status: string | null | undefined) => {
  if (!status) {
    return 'Preparing your order';
  }

  return status
    .toString()
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const formatEtaLabel = (value: number | string | null | undefined) => {
  if (value == null) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return `~${parsed} min remaining`;
};

type OngoingOrderBannerProps = {
  placement?: 'global' | 'inline';
};

const OngoingOrderBanner: React.FC<OngoingOrderBannerProps> = ({ placement = 'global' }) => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets();
  const { data: ongoingOrder, isLoading, isFetching } = useOngoingOrder();
  const isCollapsed = useOngoingOrderBannerStore((state) => state.isCollapsed);
  const setCollapsed = useOngoingOrderBannerStore((state) => state.setCollapsed);
  const lastOrderId = useOngoingOrderBannerStore((state) => state.lastOrderId);
  const setLastOrderId = useOngoingOrderBannerStore((state) => state.setLastOrderId);
  const setOrderPresence = useOngoingOrderBannerStore((state) => state.setOrderPresence);

  const hasOngoingOrder = Boolean(ongoingOrder);
  const ongoingOrderId = ongoingOrder?.id ?? null;

  useEffect(() => {
    setOrderPresence({ hasOrder: hasOngoingOrder, orderId: ongoingOrderId });

    if (ongoingOrderId != null) {
      if (lastOrderId !== ongoingOrderId) {
        setCollapsed(false);
        setLastOrderId(ongoingOrderId);
      }
      return;
    }

    if (lastOrderId !== null) {
      setLastOrderId(null);
    }
    setCollapsed(false);
  }, [hasOngoingOrder, lastOrderId, ongoingOrderId, setCollapsed, setLastOrderId, setOrderPresence]);

  const statusLabel = useMemo(() => formatStatusLabel(ongoingOrder?.status), [ongoingOrder?.status]);

  const restaurantLabel = useMemo(() => {
    const rawName = ongoingOrder?.restaurantName ?? '';
    const trimmed = rawName.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
    return 'We are confirming your restaurant';
  }, [ongoingOrder?.restaurantName]);

  const etaLabel = useMemo(() => {
    if (!ongoingOrder) {
      return null;
    }

    return (
      formatEtaLabel(ongoingOrder.estimatedDeliveryTime ?? null) ||
      formatEtaLabel(ongoingOrder.estimatedPickUpTime ?? null)
    );
  }, [ongoingOrder]);

  if (!user || (!ongoingOrder && !isLoading)) {
    return null;
  }

  if (!ongoingOrder) {
    return null;
  }

  const handleTrackOrder = () => {
    navigation.navigate('OrderTracking', {
      orderId: ongoingOrder.id,
    });
  };

  const collapsedContent = (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.collapsedContainer}
      onPress={() => setCollapsed(false)}
    >
      <View style={styles.collapsedContent}>
        <Bike size={18} color={accentColor} />
        <Text allowFontScaling={false} style={styles.collapsedText} numberOfLines={1}>
          {ongoingOrder.id ? `Order #${ongoingOrder.id}` : 'Order in progress'} · {statusLabel}
        </Text>
      </View>
      <ChevronUp size={18} color={textColor} />
    </TouchableOpacity>
  );

  const expandedContent = (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerHeader}>
        <View>
          <Text allowFontScaling={false} style={styles.bannerTitle}>
            {ongoingOrder.id ? `Order #${ongoingOrder.id}` : 'Ongoing order'}
          </Text>
          <Text allowFontScaling={false} style={styles.bannerSubtitle} numberOfLines={1}>
            {restaurantLabel}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {isFetching ? <ActivityIndicator size="small" color="#FACC15" style={styles.spinner} /> : null}
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.bannerBody}>
        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Clock size={16} color={accentColor} />
            <Text allowFontScaling={false} style={styles.statusText} numberOfLines={1}>
              {statusLabel}
            </Text>
          </View>
          {etaLabel ? (
            <View style={styles.etaPill}>
              <Bike size={15} color={backgroundColor} />
              <Text allowFontScaling={false} style={styles.etaText} numberOfLines={1}>
                {etaLabel}
              </Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.trackButton}
          onPress={handleTrackOrder}
        >
          <Text allowFontScaling={false} style={styles.trackButtonText}>
            Track order
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const containerStyle =
    placement === 'inline'
      ? styles.inlinePositioner
      : [styles.positioner, { bottom: Math.max(insets.bottom, 12) + 16 }];

  return (
    <View pointerEvents="box-none" style={containerStyle}>
      {isCollapsed ? collapsedContent : expandedContent}
    </View>
  );
};

const styles = StyleSheet.create({
  positioner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  inlinePositioner: {
    width: '100%',
  },
  bannerContainer: {
    backgroundColor,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    color: textColor,
    fontSize: 16,
    fontWeight: '700',
  },
  bannerSubtitle: {
    color: mutedTextColor,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  bannerBody: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    marginTop: 16,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(226, 232, 240, 0.25)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  statusText: {
    color: textColor,
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '600',
    maxWidth: 160,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FACC15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginLeft: 12,
  },
  etaText: {
    color: backgroundColor,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '600',
    maxWidth: 140,
  },
  trackButton: {
    backgroundColor: accentColor,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginLeft: 16,
  },
  trackButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  collapsedContainer: {
    backgroundColor,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  collapsedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  collapsedText: {
    color: textColor,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default OngoingOrderBanner;

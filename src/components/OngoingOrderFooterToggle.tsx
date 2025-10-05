import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

import useAuth from '~/hooks/useAuth';
import useOngoingOrder from '~/hooks/useOngoingOrder';
import useOngoingOrderBannerStore from '~/store/ongoingOrderBanner';
import { formatOrderStatusLabel } from '~/utils/orderStatus';

const AuthenticatedFooterToggle: React.FC = () => {
  const hasOngoingOrder = useOngoingOrderBannerStore((state) => state.hasOngoingOrder);
  const isCollapsed = useOngoingOrderBannerStore((state) => state.isCollapsed);
  const setCollapsed = useOngoingOrderBannerStore((state) => state.setCollapsed);
  const { data: ongoingOrder } = useOngoingOrder();
  const statusLabel = useMemo(
    () => formatOrderStatusLabel(ongoingOrder?.status),
    [ongoingOrder?.status]
  );
  const description = `Your ongoing order is ${statusLabel}`;

  if (!hasOngoingOrder) {
    return null;
  }

  const ToggleIcon = isCollapsed ? ChevronUp : ChevronDown;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        accessibilityLabel={isCollapsed ? 'Show order banner' : 'Hide order banner'}
        activeOpacity={0.85}
        onPress={() => setCollapsed(!isCollapsed)}
        style={styles.button}
      >
        <Text allowFontScaling={false} style={styles.description} numberOfLines={1}>
          {description}
        </Text>
        <View style={styles.iconWrapper}>
          <ToggleIcon size={16} color="#17213A" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const OngoingOrderFooterToggle: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <AuthenticatedFooterToggle />;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(23, 33, 58, 0.12)',
    maxWidth: '100%',
  },
  description: {
    color: '#17213A',
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});

export default OngoingOrderFooterToggle;


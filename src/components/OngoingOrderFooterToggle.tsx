import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bike, ChevronDown, ChevronUp } from 'lucide-react-native';

import useAuth from '~/hooks/useAuth';
import useOngoingOrder from '~/hooks/useOngoingOrder';
import useOngoingOrderBannerStore from '~/store/ongoingOrderBanner';

const backgroundColor = '#F8FAFC';
const textColor = '#17213A';
const accentColor = '#CA251B';

const OngoingOrderFooterToggle: React.FC = () => {
  const { user } = useAuth();
  const { data: ongoingOrder } = useOngoingOrder();
  const isCollapsed = useOngoingOrderBannerStore((state) => state.isCollapsed);
  const setCollapsed = useOngoingOrderBannerStore((state) => state.setCollapsed);

  if (!user || !ongoingOrder) {
    return null;
  }

  const label = useMemo(() => (isCollapsed ? 'Show order progress' : 'Hide order progress'), [isCollapsed]);
  const ToggleIcon = isCollapsed ? ChevronUp : ChevronDown;

  const orderLabel = useMemo(() => {
    if (!ongoingOrder?.id) {
      return 'Order in progress';
    }

    return `Order #${ongoingOrder.id}`;
  }, [ongoingOrder?.id]);

  return (
    <TouchableOpacity
      accessibilityLabel={`${label} banner`}
      activeOpacity={0.85}
      onPress={() => setCollapsed(!isCollapsed)}
      style={styles.button}
    >
      <View style={styles.content}>
        <View style={styles.leadingIcon}>
          <Bike size={18} color={accentColor} />
        </View>
        <View style={styles.textColumn}>
          <Text allowFontScaling={false} style={styles.orderLabel} numberOfLines={1}>
            {orderLabel}
          </Text>
          <Text allowFontScaling={false} style={styles.actionLabel} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </View>
      <View style={styles.trailingIcon}>
        <ToggleIcon size={18} color={textColor} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  leadingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(202, 37, 27, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textColumn: {
    flex: 1,
  },
  orderLabel: {
    color: textColor,
    fontSize: 13,
    fontWeight: '600',
  },
  actionLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  trailingIcon: {
    width: 24,
    alignItems: 'center',
  },
});

export default OngoingOrderFooterToggle;


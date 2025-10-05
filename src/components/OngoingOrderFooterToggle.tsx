import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

import useAuth from '~/hooks/useAuth';
import useOngoingOrderBannerStore from '~/store/ongoingOrderBanner';

const AuthenticatedFooterToggle: React.FC = () => {
  const hasOngoingOrder = useOngoingOrderBannerStore((state) => state.hasOngoingOrder);
  const isCollapsed = useOngoingOrderBannerStore((state) => state.isCollapsed);
  const setCollapsed = useOngoingOrderBannerStore((state) => state.setCollapsed);

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
        <ToggleIcon size={18} color="#17213A" />
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(23, 33, 58, 0.12)',
  },
});

export default OngoingOrderFooterToggle;


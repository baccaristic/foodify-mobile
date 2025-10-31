import React, { memo } from 'react';
import { View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

import SkeletonPulse from './SkeletonPulse';

interface OrderHistorySkeletonProps {
  count?: number;
}

const OrderHistorySkeleton: React.FC<OrderHistorySkeletonProps> = ({ count = 6 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={`order-skeleton-${index}`} style={styles.card}>
          <SkeletonPulse style={styles.image} />
          <View style={styles.content}>
            <SkeletonPulse style={styles.title} />
            <SkeletonPulse style={styles.subtitle} />
            <View style={styles.row}>
              <SkeletonPulse style={styles.status} />
              <SkeletonPulse style={styles.button} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default memo(OrderHistorySkeleton);

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '16@s',
    paddingTop: '16@vs',
    paddingBottom: '40@vs',
    gap: '16@vs',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    padding: '12@s',
    gap: '12@s',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '72@s',
    height: '72@vs',
    borderRadius: '12@ms',
  },
  content: {
    flex: 1,
    gap: '10@vs',
  },
  title: {
    width: '70%',
    height: '18@vs',
    borderRadius: '10@ms',
  },
  subtitle: {
    width: '90%',
    height: '12@vs',
    borderRadius: '10@ms',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: {
    width: '40%',
    height: '14@vs',
    borderRadius: '10@ms',
  },
  button: {
    width: '28%',
    height: '24@vs',
    borderRadius: '14@ms',
  },
});

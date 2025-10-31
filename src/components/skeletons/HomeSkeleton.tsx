import React, { memo } from 'react';
import { View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

import SkeletonPulse from './SkeletonPulse';

const HomeSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <SkeletonPulse style={styles.sectionTitle} />
        <View style={styles.horizontalList}>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonPulse key={`top-skeleton-${index}`} style={styles.topCard} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SkeletonPulse style={styles.sectionTitle} />
        <View style={styles.horizontalList}>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonPulse key={`carousel-skeleton-${index}`} style={styles.carouselCard} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SkeletonPulse style={styles.sectionTitle} />
        <View style={styles.verticalList}>
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonPulse key={`list-skeleton-${index}`} style={styles.verticalCard} />
          ))}
        </View>
      </View>
    </View>
  );
};

export default memo(HomeSkeleton);

const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: '16@s',
    paddingTop: '8@vs',
    paddingBottom: '32@vs',
    gap: '24@vs',
  },
  section: {
    gap: '16@vs',
  },
  sectionTitle: {
    width: '140@s',
    height: '20@vs',
    borderRadius: '10@ms',
  },
  horizontalList: {
    flexDirection: 'row',
    gap: '12@s',
  },
  topCard: {
    width: '160@s',
    height: '200@vs',
    borderRadius: '20@ms',
  },
  carouselCard: {
    width: '220@s',
    height: '180@vs',
    borderRadius: '20@ms',
  },
  verticalList: {
    gap: '16@vs',
  },
  verticalCard: {
    width: '100%',
    height: '200@vs',
    borderRadius: '20@ms',
  },
});

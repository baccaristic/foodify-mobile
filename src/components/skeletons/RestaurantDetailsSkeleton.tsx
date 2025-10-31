import React, { memo } from 'react';
import { View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

import SkeletonPulse from './SkeletonPulse';

const RestaurantDetailsSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <SkeletonPulse style={styles.heroImage} />

      <View style={styles.headerRow}>
        <SkeletonPulse style={styles.avatar} />
        <View style={styles.headerContent}>
          <SkeletonPulse style={styles.title} />
          <SkeletonPulse style={styles.subtitle} />
        </View>
      </View>

      <View style={styles.metaRow}>
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonPulse key={`meta-${index}`} style={styles.metaPill} />
        ))}
      </View>

      <View style={styles.section}>
        <SkeletonPulse style={styles.sectionTitle} />
        <SkeletonPulse style={styles.sectionText} />
        <SkeletonPulse style={styles.sectionTextShort} />
      </View>

      <View style={styles.section}>
        <SkeletonPulse style={styles.sectionTitle} />
        <View style={styles.gridRow}>
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonPulse key={`top-${index}`} style={styles.gridCard} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SkeletonPulse style={styles.sectionTitleWide} />
        <View style={styles.gridRow}>
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonPulse key={`menu-${index}`} style={styles.menuCard} />
          ))}
        </View>
      </View>
    </View>
  );
};

export default memo(RestaurantDetailsSkeleton);

const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: '16@s',
    paddingTop: '16@vs',
    paddingBottom: '40@vs',
    gap: '24@vs',
  },
  heroImage: {
    width: '100%',
    height: '180@vs',
    borderRadius: '28@ms',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '16@s',
  },
  avatar: {
    width: '64@s',
    height: '64@s',
    borderRadius: '22@ms',
  },
  headerContent: {
    flex: 1,
    gap: '10@vs',
  },
  title: {
    width: '70%',
    height: '22@vs',
    borderRadius: '10@ms',
  },
  subtitle: {
    width: '55%',
    height: '18@vs',
    borderRadius: '10@ms',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '12@s',
  },
  metaPill: {
    width: '90@s',
    height: '28@vs',
    borderRadius: '16@ms',
  },
  section: {
    gap: '16@vs',
  },
  sectionTitle: {
    width: '160@s',
    height: '20@vs',
    borderRadius: '10@ms',
  },
  sectionTitleWide: {
    width: '200@s',
    height: '20@vs',
    borderRadius: '10@ms',
  },
  sectionText: {
    width: '100%',
    height: '16@vs',
    borderRadius: '10@ms',
  },
  sectionTextShort: {
    width: '70%',
    height: '16@vs',
    borderRadius: '10@ms',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '16@s',
  },
  gridCard: {
    width: '47%',
    height: '180@vs',
    borderRadius: '22@ms',
  },
  menuCard: {
    width: '47%',
    height: '200@vs',
    borderRadius: '22@ms',
  },
});

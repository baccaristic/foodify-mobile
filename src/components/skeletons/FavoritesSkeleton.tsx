import React from 'react';
import { View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

import SkeletonPulse from './SkeletonPulse';

interface FavoritesSkeletonProps {
  restaurantCardWidth: number;
}

const FavoritesSkeleton: React.FC<FavoritesSkeletonProps> = ({ restaurantCardWidth }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonPulse style={styles.sectionTitle} />
          <SkeletonPulse style={styles.sectionSubtitle} />
        </View>
        <View style={styles.carouselRow}>
          {[0, 1].map((index) => (
            <SkeletonPulse
              key={`favorite-restaurant-skeleton-${index}`}
              style={[styles.restaurantCard, { width: restaurantCardWidth }]}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonPulse style={styles.sectionTitle} />
          <SkeletonPulse style={[styles.sectionSubtitle, styles.sectionSubtitleShort]} />
        </View>
        <View style={styles.menuList}>
          {[0, 1, 2].map((index) => (
            <View key={`favorite-menu-skeleton-${index}`} style={styles.menuItemRow}>
              <SkeletonPulse style={styles.menuImage} />
              <View style={styles.menuContent}>
                <SkeletonPulse style={styles.menuLineLarge} />
                <SkeletonPulse style={styles.menuLineMedium} />
                <SkeletonPulse style={styles.menuLineSmall} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default FavoritesSkeleton;

const styles = ScaledSheet.create({
  wrapper: {
    paddingHorizontal: '18@s',
    paddingTop: '8@vs',
    paddingBottom: '32@vs',
    gap: '32@vs',
  },
  section: {
    gap: '18@vs',
  },
  sectionHeader: {
    gap: '6@vs',
  },
  sectionTitle: {
    height: '22@vs',
    borderRadius: '16@ms',
  },
  sectionSubtitle: {
    height: '16@vs',
    borderRadius: '14@ms',
  },
  sectionSubtitleShort: {
    width: '50%',
  },
  carouselRow: {
    flexDirection: 'row',
    gap: '14@s',
  },
  restaurantCard: {
    height: '200@vs',
    borderRadius: '20@ms',
  },
  menuList: {
    gap: '16@vs',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '20@ms',
    padding: '12@s',
    gap: '14@s',
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  menuImage: {
    width: '96@s',
    height: '96@vs',
    borderRadius: '16@ms',
  },
  menuContent: {
    flex: 1,
    gap: '10@vs',
  },
  menuLineLarge: {
    height: '18@vs',
    borderRadius: '14@ms',
  },
  menuLineMedium: {
    height: '14@vs',
    width: '70%',
    borderRadius: '14@ms',
  },
  menuLineSmall: {
    height: '12@vs',
    width: '40%',
    borderRadius: '14@ms',
  },
});

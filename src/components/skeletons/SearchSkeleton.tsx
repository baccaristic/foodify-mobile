import React from 'react';
import { View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

import SkeletonPulse from './SkeletonPulse';

const SearchSkeleton: React.FC = () => {
  return (
    <View style={styles.wrapper}>
      {[0, 1, 2].map((index) => (
        <View key={`search-skeleton-${index}`} style={styles.resultBlock}>
          <View style={styles.restaurantCard}>
            <SkeletonPulse style={styles.restaurantImage} />
            <View style={styles.restaurantContent}>
              <SkeletonPulse style={styles.restaurantTitle} />
              <SkeletonPulse style={styles.restaurantSubtitle} />
              <View style={styles.restaurantMetaRow}>
                <SkeletonPulse style={styles.restaurantMetaShort} />
                <SkeletonPulse style={styles.restaurantMetaShort} />
              </View>
            </View>
          </View>

          <View style={styles.promotionsBlock}>
            <SkeletonPulse style={styles.promotionsHeading} />
            <View style={styles.promotionList}>
              {[0, 1].map((promoIndex) => (
                <View key={`promotion-skeleton-${index}-${promoIndex}`} style={styles.promotionItem}>
                  <SkeletonPulse style={styles.promotionImage} />
                  <View style={styles.promotionContent}>
                    <SkeletonPulse style={styles.promotionTitle} />
                    <SkeletonPulse style={styles.promotionSubtitle} />
                  </View>
                  <SkeletonPulse style={styles.promotionPrice} />
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default SearchSkeleton;

const styles = ScaledSheet.create({
  wrapper: {
    paddingHorizontal: '16@s',
    paddingTop: '12@vs',
    paddingBottom: '60@vs',
    gap: '22@vs',
  },
  resultBlock: {
    gap: '14@vs',
  },
  restaurantCard: {
    backgroundColor: 'white',
    borderRadius: '16@ms',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  restaurantImage: {
    height: '180@vs',
    width: '100%',
  },
  restaurantContent: {
    paddingHorizontal: '14@s',
    paddingVertical: '12@vs',
    gap: '10@vs',
  },
  restaurantTitle: {
    height: '20@vs',
    borderRadius: '14@ms',
  },
  restaurantSubtitle: {
    height: '14@vs',
    width: '60%',
    borderRadius: '14@ms',
  },
  restaurantMetaRow: {
    flexDirection: 'row',
    gap: '12@s',
  },
  restaurantMetaShort: {
    flex: 1,
    height: '12@vs',
    borderRadius: '12@ms',
  },
  promotionsBlock: {
    gap: '12@vs',
  },
  promotionsHeading: {
    height: '14@vs',
    width: '40%',
    borderRadius: '14@ms',
  },
  promotionList: {
    gap: '12@vs',
  },
  promotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '16@ms',
    paddingHorizontal: '12@s',
    paddingVertical: '10@vs',
    gap: '12@s',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  promotionImage: {
    width: '64@s',
    height: '64@s',
    borderRadius: '14@ms',
  },
  promotionContent: {
    flex: 1,
    gap: '8@vs',
  },
  promotionTitle: {
    height: '16@vs',
    borderRadius: '12@ms',
  },
  promotionSubtitle: {
    height: '12@vs',
    width: '70%',
    borderRadius: '12@ms',
  },
  promotionPrice: {
    width: '54@s',
    height: '18@vs',
    borderRadius: '12@ms',
  },
});

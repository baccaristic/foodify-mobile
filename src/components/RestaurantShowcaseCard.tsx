import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ScaledSheet, s } from 'react-native-size-matters';
import { Image } from 'expo-image';
import { ArrowRight, Star, UtensilsCrossed, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_API_URL } from '@env';

import { useTranslation } from '~/localization';
import { hasValidEstimatedDeliveryTime } from '~/utils/restaurantFavorites';

const fallbackImage = require('../../assets/baguette.png');

const resolveImageSource = (imagePath?: string | null) => {
  if (imagePath) {
    return { uri: `${BASE_API_URL}/auth/image/${imagePath}` };
  }

  return fallbackImage;
};

export interface RestaurantShowcaseCardProps {
  name: string;
  description?: string | null;
  address?: string | null;
  rating?: string | number | null;
  type?: string | null;
  imageUrl?: string | null;
  fallbackImageUrl?: string | null;
  openingHours?: string | null;
  closingHours?: string | null;
  estimatedDeliveryTime?: number;
  onPress: () => void;
  width?: number | string;
  height?: number | string;
  style?: StyleProp<ViewStyle>;
  open?: boolean;
}

const toNumericRating = (rating?: string | number | null) => {
  if (rating == null) {
    return null;
  }

  if (typeof rating === 'number') {
    return Number.isFinite(rating) ? rating : null;
  }

  if (typeof rating === 'string') {
    const parsed = parseFloat(rating);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const RestaurantShowcaseCard: React.FC<RestaurantShowcaseCardProps> = ({
  name,
  description,
  address,
  rating,
  type,
  imageUrl,
  fallbackImageUrl,
  openingHours,
  closingHours,
  estimatedDeliveryTime,
  onPress,
  width,
  height,
  style,
  open = true,
}) => {
  const { t } = useTranslation();
  const numericRating = useMemo(() => toNumericRating(rating), [rating]);

  const ratingLabel = useMemo(() => {
    if (numericRating == null || numericRating <= 0) {
      return t('profile.favorites.labels.new');
    }

    return t('profile.favorites.labels.rating', {
      values: { rating: numericRating.toFixed(1) },
    });
  }, [numericRating, t]);

  const descriptionText = useMemo(() => {
    if (typeof description === 'string') {
      const trimmed = description.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }

    if (typeof address === 'string') {
      const trimmedAddress = address.trim();
      if (trimmedAddress.length > 0) {
        return trimmedAddress;
      }
    }

    return '';
  }, [address, description]);

  const hintText = useMemo(() => {
    if (hasValidEstimatedDeliveryTime(estimatedDeliveryTime)) {
      return `${estimatedDeliveryTime} ${t('profile.favorites.labels.deliveryMinutes')}`;
    }

    if (openingHours && closingHours) {
      return `${openingHours} - ${closingHours}`;
    }

    return t('profile.favorites.labels.openMenuHint');
  }, [estimatedDeliveryTime, closingHours, openingHours, t]);

  const imageSource = useMemo(() => {
    return resolveImageSource(imageUrl ?? fallbackImageUrl);
  }, [fallbackImageUrl, imageUrl]);

  const isClosed = open === false;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        width != null ? { width } : null,
        height != null ? { height } : null,
        style,
      ]}>
      <Image source={imageSource} style={styles.image} contentFit="cover" />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Star size={s(14)} color="#FACC15" fill="#FACC15" />
            <Text allowFontScaling={false} style={styles.metaPillText} numberOfLines={1}>
              {ratingLabel}
            </Text>
          </View>
          <View style={styles.metaPill}>
            <UtensilsCrossed size={s(14)} color="white" />
            <Text allowFontScaling={false} style={styles.metaPillText} numberOfLines={1}>
              {type?.trim().length ? type : t('profile.favorites.labels.defaultCuisine')}
            </Text>
          </View>
        </View>
        <Text allowFontScaling={false} style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        {descriptionText.length > 0 ? (
          <Text allowFontScaling={false} style={styles.description} numberOfLines={2}>
            {descriptionText}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <Text allowFontScaling={false} style={styles.hint} numberOfLines={1}>
            {hintText}
          </Text>
          <ArrowRight size={s(16)} color="white" />
        </View>
      </View>
      {isClosed && (
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.85)']}
          style={styles.closedOverlay}>
          <View style={styles.closedContent}>
            <Lock size={s(32)} color="white" />
            <Text allowFontScaling={false} style={styles.closedTitle}>
              {t('restaurantCard.currentlyClosed')}
            </Text>
            {openingHours ? (
              <Text allowFontScaling={false} style={styles.closedSubtitle}>
                {t('restaurantCard.opensAt', { time: openingHours })}
              </Text>
            ) : null}
          </View>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

export default RestaurantShowcaseCard;

const styles = ScaledSheet.create({
  card: {
    height: '200@vs',
    borderRadius: '20@ms',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23, 33, 58, 0.45)',
  },
  content: {
    position: 'absolute',
    inset: 0,
    paddingHorizontal: '16@s',
    paddingVertical: '18@vs',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '10@s',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '10@s',
    paddingVertical: '6@vs',
    borderRadius: '16@ms',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    gap: '6@s',
  },
  metaPillText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  name: {
    fontSize: '20@ms',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  description: {
    fontSize: '13@ms',
    color: '#E2E8F0',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    fontSize: '12@ms',
    color: '#F8FAFC',
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedContent: {
    alignItems: 'center',
    gap: '8@vs',
  },
  closedTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  closedSubtitle: {
    fontSize: '14@ms',
    fontWeight: '500',
    color: '#E2E8F0',
    textAlign: 'center',
  },
});

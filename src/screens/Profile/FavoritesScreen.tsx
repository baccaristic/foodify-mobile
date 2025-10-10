import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Sparkles,
  Star,
  UtensilsCrossed,
} from 'lucide-react-native';

import MainLayout from '~/layouts/MainLayout';
import { getClientFavorites } from '~/api/favorites';
import type {
  ClientFavoritesResponse,
  FavoriteMenuItem,
  FavoriteRestaurant,
} from '~/interfaces/Favorites';
import { BASE_API_URL } from '@env';

const headerBackground = require('../../../assets/pattern1.png');
const fallbackImage = require('../../../assets/baguette.png');

const accentColor = '#CA251B';
const primaryText = '#17213A';
const mutedText = '#6B7280';

const formatCurrency = (value: number) => `${value.toFixed(3).replace('.', ',')} DT`;

const resolveImageSource = (imagePath?: string | null) => {
  if (imagePath) {
    return { uri: `${BASE_API_URL}/auth/image/${imagePath}` };
  }
  return fallbackImage;
};

const FavoriteRestaurantCard = ({
  restaurant,
  onPress,
}: {
  restaurant: FavoriteRestaurant;
  onPress: () => void;
}) => {
  const ratingLabel = useMemo(() => {
    if (restaurant.rating == null) {
      return 'New';
    }

    const numericRating = Number(restaurant.rating);

    if (!Number.isFinite(numericRating) || numericRating <= 0) {
      return 'New';
    }

    return `${numericRating.toFixed(1)} / 5`;
  }, [restaurant.rating]);

  return (
    <TouchableOpacity style={styles.restaurantCard} activeOpacity={0.9} onPress={onPress}>
      <Image source={resolveImageSource(restaurant.imageUrl)} style={styles.restaurantImage} contentFit="cover" />
      <View style={styles.restaurantOverlay} />
      <View style={styles.restaurantContent}>
        <View style={styles.restaurantMetaRow}>
          <View style={styles.metaPill}>
            <Star size={s(14)} color="#FACC15" fill="#FACC15" />
            <Text allowFontScaling={false} style={styles.metaPillText}>
              {ratingLabel}
            </Text>
          </View>
          <View style={styles.metaPill}>
            <UtensilsCrossed size={s(14)} color="white" />
            <Text allowFontScaling={false} style={styles.metaPillText}>
              {restaurant.type || 'Cuisine mix'}
            </Text>
          </View>
        </View>
        <Text allowFontScaling={false} style={styles.restaurantName} numberOfLines={2}>
          {restaurant.name}
        </Text>
        <Text allowFontScaling={false} style={styles.restaurantDescription} numberOfLines={2}>
          {(() => {
            if (typeof restaurant.description === 'string') {
              const trimmed = restaurant.description.trim();
              if (trimmed.length > 0) {
                return trimmed;
              }
            }
            return restaurant.address;
          })()}
        </Text>
        <View style={styles.restaurantFooter}>
          <Text allowFontScaling={false} style={styles.restaurantHint} numberOfLines={1}>
            {restaurant.openingHours && restaurant.closingHours
              ? `${restaurant.openingHours} - ${restaurant.closingHours}`
              : 'Tap to open the full menu'}
          </Text>
          <ArrowRight size={s(16)} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FavoriteMenuItemCard = ({
  item,
  onPress,
}: {
  item: FavoriteMenuItem;
  onPress: () => void;
}) => {
  const hasPromotion = item.promotionActive && typeof item.promotionPrice === 'number';

  return (
    <TouchableOpacity style={styles.menuItemCard} activeOpacity={0.88} onPress={onPress}>
      <Image source={resolveImageSource(item.imageUrl)} style={styles.menuImage} contentFit="cover" />
      <View style={styles.menuContent}>
        <View style={styles.menuHeaderRow}>
          <Text allowFontScaling={false} style={styles.menuTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text allowFontScaling={false} style={[styles.menuPrice, hasPromotion && styles.menuPromotionPrice]}>
            {hasPromotion ? formatCurrency(item.promotionPrice ?? item.price) : formatCurrency(item.price)}
          </Text>
        </View>
        {hasPromotion ? (
          <Text allowFontScaling={false} style={styles.menuOriginalPrice}>
            {formatCurrency(item.price)}
          </Text>
        ) : null}
        <Text allowFontScaling={false} style={styles.menuRestaurant} numberOfLines={1}>
          {item.restaurantName}
        </Text>
        <Text allowFontScaling={false} style={styles.menuDescription} numberOfLines={2}>
          {(() => {
            if (typeof item.description === 'string') {
              const trimmed = item.description.trim();
              if (trimmed.length > 0) {
                return trimmed;
              }
            }
            return 'Tap to customise and add it to your cart.';
          })()}
        </Text>
        <View style={styles.menuBadgesRow}>
          {item.promotionLabel && item.promotionActive ? (
            <View style={[styles.badge, styles.badgeAccent]}>
              <Sparkles size={s(12)} color="white" />
              <Text allowFontScaling={false} style={styles.badgeText}>
                {item.promotionLabel}
              </Text>
            </View>
          ) : null}
          {item.popular ? (
            <View style={[styles.badge, styles.badgeWarm]}>
              <Flame size={s(12)} color="white" />
              <Text allowFontScaling={false} style={styles.badgeText}>Popular</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FavoritesScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const { data, isLoading, isError, isFetching, refetch } = useQuery<ClientFavoritesResponse>({
    queryKey: ['client', 'favorites'],
    queryFn: getClientFavorites,
  });

  const favoriteRestaurants = data?.restaurants ?? [];
  const favoriteMenuItems = data?.menuItems ?? [];
  const hasFavorites = favoriteRestaurants.length > 0 || favoriteMenuItems.length > 0;

  const customHeader = (
    <View style={styles.headerWrapper}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
          style={styles.headerBackButton}
        >
          <ArrowLeft size={s(22)} color={accentColor} />
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <Text allowFontScaling={false} style={styles.headerTitle}>
            Your saved flavors
          </Text>
          <Text allowFontScaling={false} style={styles.headerSubtitle} numberOfLines={2}>
            Revisit the restaurants and dishes that stole your heart.
          </Text>
        </View>
      </View>
      <View style={styles.headerStatsRow}>
        <View style={styles.statCard}>
          <Text allowFontScaling={false} style={styles.statLabel}>
            Restaurants
          </Text>
          <Text allowFontScaling={false} style={styles.statValue}>
            {favoriteRestaurants.length}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text allowFontScaling={false} style={styles.statLabel}>
            Dishes
          </Text>
          <Text allowFontScaling={false} style={styles.statValue}>
            {favoriteMenuItems.length}
          </Text>
        </View>
      </View>
    </View>
  );

  let mainContent: React.ReactNode;

  if (isLoading) {
    mainContent = (
      <View style={styles.stateWrapper}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text allowFontScaling={false} style={styles.stateTitle}>
          Setting the table for your favorites…
        </Text>
      </View>
    );
  } else if (isError) {
    mainContent = (
      <View style={styles.stateWrapper}>
        <Text allowFontScaling={false} style={styles.stateTitle}>
          We could not fetch your saved spots.
        </Text>
        <Text allowFontScaling={false} style={styles.stateSubtitle}>
          Check your connection and try again.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text allowFontScaling={false} style={styles.retryLabel}>
            Try again
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else if (!hasFavorites) {
    mainContent = (
      <View style={styles.stateWrapper}>
        <Text allowFontScaling={false} style={styles.stateTitle}>
          Your heart is wide open.
        </Text>
        <Text allowFontScaling={false} style={styles.stateSubtitle}>
          Explore restaurants and tap the heart to start your collection.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text allowFontScaling={false} style={styles.primaryButtonLabel}>
            Discover restaurants
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    mainContent = (
      <View style={styles.contentWrapper}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text allowFontScaling={false} style={styles.sectionTitle}>
              Beloved restaurants
            </Text>
            <Text allowFontScaling={false} style={styles.sectionSubtitle}>
              Cozy corners and go-to kitchens
            </Text>
          </View>
          <View style={styles.restaurantGrid}>
            {favoriteRestaurants.map((restaurant) => (
              <FavoriteRestaurantCard
                key={`favorite-restaurant-${restaurant.id}`}
                restaurant={restaurant}
                onPress={() =>
                  navigation.navigate('RestaurantDetails' as never, {
                    restaurantId: restaurant.id,
                  } as never)
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text allowFontScaling={false} style={styles.sectionTitle}>
              Saved dishes
            </Text>
            <Text allowFontScaling={false} style={styles.sectionSubtitle}>
              Cravings worth coming back to
            </Text>
          </View>
          <View style={styles.menuList}>
            {favoriteMenuItems.map((item) => (
              <FavoriteMenuItemCard
                key={`favorite-item-${item.id}`}
                item={item}
                onPress={() =>
                  navigation.navigate('RestaurantDetails' as never, {
                    restaurantId: item.restaurantId,
                    menuItemId: item.id,
                  } as never)
                }
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <MainLayout
      showFooter
      activeTab="Profile"
      enableHeaderCollapse={false}
      enforceResponsiveHeaderSize={false}
      headerMaxHeight={vs(200)}
      headerMinHeight={vs(120)}
      headerBackgroundImage={headerBackground}
      customHeader={customHeader}
      mainContent={mainContent}
      onRefresh={refetch}
      isRefreshing={isFetching}
    />
  );
};

export default FavoritesScreen;

const styles = ScaledSheet.create({
  headerWrapper: {
    flex: 1,
    paddingHorizontal: '18@s',
    paddingTop: '32@vs',
    paddingBottom: '12@vs',
    justifyContent: 'space-between',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '12@s',
  },
  headerBackButton: {
    width: '42@s',
    height: '42@s',
    borderRadius: '21@s',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerTextBlock: {
    flex: 1,
    gap: '6@vs',
  },
  headerTitle: {
    fontSize: '22@ms',
    fontWeight: '700',
    color: primaryText,
  },
  headerSubtitle: {
    fontSize: '14@ms',
    color: '#f5f5f5',
    fontWeight: '500',
  },
  headerStatsRow: {
    flexDirection: 'row',
    marginTop: '18@vs',
    gap: '12@s',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: '18@ms',
    paddingVertical: '14@vs',
    paddingHorizontal: '16@s',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statLabel: {
    fontSize: '13@ms',
    color: mutedText,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statValue: {
    marginTop: '6@vs',
    fontSize: '24@ms',
    fontWeight: '700',
    color: accentColor,
  },
  contentWrapper: {
    gap: '32@vs',
    paddingHorizontal: '18@s',
  },
  section: {
    gap: '18@vs',
  },
  sectionHeader: {
    gap: '6@vs',
  },
  sectionTitle: {
    fontSize: '20@ms',
    fontWeight: '700',
    color: primaryText,
  },
  sectionSubtitle: {
    fontSize: '14@ms',
    color: mutedText,
  },
  restaurantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '14@s',
  },
  restaurantCard: {
    width: '160@s',
    height: '200@vs',
    borderRadius: '20@ms',
    overflow: 'hidden',
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    borderRadius: '20@ms',
  },
  restaurantOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23, 33, 58, 0.45)',
  },
  restaurantContent: {
    position: 'absolute',
    inset: 0,
    padding: '14@s',
    justifyContent: 'space-between',
  },
  restaurantMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '16@ms',
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    gap: '4@s',
  },
  metaPillText: {
    color: 'white',
    fontSize: '11@ms',
    fontWeight: '600',
  },
  restaurantName: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: 'white',
  },
  restaurantDescription: {
    fontSize: '12@ms',
    color: 'rgba(255,255,255,0.85)',
  },
  restaurantFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  restaurantHint: {
    flex: 1,
    color: 'rgba(255,255,255,0.85)',
    fontSize: '11@ms',
    marginRight: '8@s',
  },
  menuList: {
    gap: '16@vs',
  },
  menuItemCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: '20@ms',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  menuImage: {
    width: '110@s',
    height: '110@vs',
  },
  menuContent: {
    flex: 1,
    paddingVertical: '12@vs',
    paddingHorizontal: '14@s',
    gap: '6@vs',
  },
  menuHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '12@s',
  },
  menuTitle: {
    flex: 1,
    fontSize: '16@ms',
    fontWeight: '700',
    color: primaryText,
  },
  menuPrice: {
    fontSize: '15@ms',
    fontWeight: '700',
    color: accentColor,
  },
  menuPromotionPrice: {
    color: '#0F9F4F',
  },
  menuOriginalPrice: {
    fontSize: '12@ms',
    color: mutedText,
    textDecorationLine: 'line-through',
  },
  menuRestaurant: {
    fontSize: '13@ms',
    color: accentColor,
    fontWeight: '600',
  },
  menuDescription: {
    fontSize: '12@ms',
    color: mutedText,
  },
  menuBadgesRow: {
    flexDirection: 'row',
    gap: '8@s',
    marginTop: '4@vs',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '14@ms',
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    gap: '4@s',
  },
  badgeAccent: {
    backgroundColor: accentColor,
  },
  badgeWarm: {
    backgroundColor: '#F97316',
  },
  badgeText: {
    fontSize: '11@ms',
    color: 'white',
    fontWeight: '600',
  },
  stateWrapper: {
    flex: 1,
    paddingHorizontal: '18@s',
    paddingVertical: '40@vs',
    alignItems: 'center',
    gap: '16@vs',
  },
  stateTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: primaryText,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: '14@ms',
    color: mutedText,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: '6@vs',
    paddingHorizontal: '20@s',
    paddingVertical: '10@vs',
    borderRadius: '18@ms',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: accentColor,
  },
  retryLabel: {
    color: accentColor,
    fontSize: '14@ms',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: '10@vs',
    backgroundColor: accentColor,
    paddingHorizontal: '22@s',
    paddingVertical: '12@vs',
    borderRadius: '20@ms',
  },
  primaryButtonLabel: {
    color: 'white',
    fontSize: '15@ms',
    fontWeight: '700',
  },
});

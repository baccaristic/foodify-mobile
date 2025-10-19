import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { Image } from 'expo-image';
import { ArrowRight, Flame, Sparkles, Star, UtensilsCrossed } from 'lucide-react-native';

import MainLayout from '~/layouts/MainLayout';
import { getClientFavorites } from '~/api/favorites';
import type {
  ClientFavoritesResponse,
  FavoriteMenuItem,
  FavoriteRestaurant,
} from '~/interfaces/Favorites';
import { BASE_API_URL } from '@env';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import { useTranslation } from '~/localization';

const fallbackImage = require('../../../assets/baguette.png');

const accentColor = '#CA251B';
const primaryText = '#17213A';
const mutedText = '#6B7280';

const carouselHorizontalPadding = s(18);
const restaurantItemGap = s(14);

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
  width,
}: {
  restaurant: FavoriteRestaurant;
  onPress: () => void;
  width: number;
}) => {
  const { t } = useTranslation();
  const ratingLabel = useMemo(() => {
    if (restaurant.rating == null) {
      return t('profile.favorites.labels.new');
    }

    const numericRating = Number(restaurant.rating);

    if (!Number.isFinite(numericRating) || numericRating <= 0) {
      return t('profile.favorites.labels.new');
    }

    return t('profile.favorites.labels.rating', { values: { rating: numericRating.toFixed(1) } });
  }, [restaurant.rating, t]);

  return (
    <TouchableOpacity
      style={[styles.restaurantCard, { width }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
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
              {restaurant.type || t('profile.favorites.labels.defaultCuisine')}
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
              : t('profile.favorites.labels.openMenuHint')}
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
  const { t } = useTranslation();

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
            return t('profile.favorites.labels.addToCartHint');
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
              <Text allowFontScaling={false} style={styles.badgeText}>
                {t('profile.favorites.labels.popular')}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FavoritesScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();

  const restaurantCardWidth = useMemo(
    () => Math.max(screenWidth - carouselHorizontalPadding * 2, s(240)),
    [screenWidth],
  );

  const restaurantSnapInterval = useMemo(
    () => restaurantCardWidth + restaurantItemGap,
    [restaurantCardWidth],
  );

  const { data, isLoading, isError, isFetching, refetch } = useQuery<ClientFavoritesResponse>({
    queryKey: ['client', 'favorites'],
    queryFn: getClientFavorites,
  });

  const favoriteRestaurants = data?.restaurants ?? [];
  const favoriteMenuItems = data?.menuItems ?? [];
  const enableRestaurantPaging = favoriteRestaurants.length > 1;
  const hasFavorites = favoriteRestaurants.length > 0 || favoriteMenuItems.length > 0;

  const customHeader = (
    <View>
      <HeaderWithBackButton
        title={t('profile.favorites.title')}
        titleMarginLeft={s(70)}
        onBack={() => navigation.goBack()}
      />
    </View>
  );

  let mainContent: React.ReactNode;

  if (isLoading) {
    mainContent = (
      <View style={styles.stateWrapper}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text allowFontScaling={false} style={styles.stateTitle}>
          {t('profile.favorites.states.loadingTitle')}
        </Text>
      </View>
    );
  } else if (isError) {
    mainContent = (
      <View style={styles.stateWrapper}>
        <Text allowFontScaling={false} style={styles.stateTitle}>
          {t('profile.favorites.states.errorTitle')}
        </Text>
        <Text allowFontScaling={false} style={styles.stateSubtitle}>
          {t('profile.favorites.states.errorSubtitle')}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text allowFontScaling={false} style={styles.retryLabel}>
            {t('profile.favorites.actions.retry')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else if (!hasFavorites) {
    mainContent = (
      <View style={styles.stateWrapper}>
        <Text allowFontScaling={false} style={styles.stateTitle}>
          {t('profile.favorites.states.emptyTitle')}
        </Text>
        <Text allowFontScaling={false} style={styles.stateSubtitle}>
          {t('profile.favorites.states.emptySubtitle')}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text allowFontScaling={false} style={styles.primaryButtonLabel}>
            {t('profile.favorites.actions.discover')}
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
              {t('profile.favorites.sections.restaurants.title')}
            </Text>
            <Text allowFontScaling={false} style={styles.sectionSubtitle}>
              {t('profile.favorites.sections.restaurants.subtitle')}
            </Text>
          </View>
          <FlatList
            horizontal
            pagingEnabled={enableRestaurantPaging}
            decelerationRate={enableRestaurantPaging ? 'fast' : 'normal'}
            snapToAlignment="start"
            snapToInterval={enableRestaurantPaging ? restaurantSnapInterval : undefined}
            data={favoriteRestaurants}
            keyExtractor={(restaurant) => `favorite-restaurant-${restaurant.id}`}
            renderItem={({ item: restaurant }) => (
              <FavoriteRestaurantCard
                restaurant={restaurant}
                width={restaurantCardWidth}
                onPress={() =>
                  navigation.navigate('RestaurantDetails' as never, {
                    restaurantId: restaurant.id,
                  } as never)
                }
              />
            )}
            showsHorizontalScrollIndicator={false}
            style={styles.restaurantCarousel}
            contentContainerStyle={styles.restaurantCarouselContent}
            ItemSeparatorComponent={() => <View style={styles.restaurantSeparator} />}
          />
        </View>

       <View style={styles.section}>
         <View style={styles.sectionHeader}>
           <Text allowFontScaling={false} style={styles.sectionTitle}>
              {t('profile.favorites.sections.menu.title')}
            </Text>
            <Text allowFontScaling={false} style={styles.sectionSubtitle}>
              {t('profile.favorites.sections.menu.subtitle')}
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
      headerMaxHeight={vs(60)}
      headerMinHeight={vs(40)}
      customHeader={customHeader}
      mainContent={mainContent}
      onRefresh={refetch}
      isRefreshing={isFetching}
    />
  );
};

export default FavoritesScreen;

const styles = ScaledSheet.create({
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
  restaurantCarousel: {
    marginHorizontal: -s(18),
  },
  restaurantCarouselContent: {
    paddingHorizontal: carouselHorizontalPadding,
  },
  restaurantSeparator: {
    width: restaurantItemGap,
  },
  restaurantCard: {
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

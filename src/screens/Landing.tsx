import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Search, MapPin, Utensils, ChevronDown } from 'lucide-react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import MainLayout from '~/layouts/MainLayout';
import RestaurantShowcaseCard from '~/components/RestaurantShowcaseCard';
import useSelectedAddress from '~/hooks/useSelectedAddress';
import useLocationOverlay from '~/hooks/useLocationOverlay';
import { useTranslation, useLocalization } from '~/localization';
import { getNearbyRestaurantsPage } from '~/api/restaurants';
import { PageResponse, RestaurantDisplayDto } from '~/interfaces/Restaurant';
import { getLocalizedName, getLocalizedDescriptionNullable } from '~/utils/localization';

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;

// Bubble configuration - adjusted sizes and positions to match reference
const BUBBLES = [
  { size: 110, x: screenWidth * 0.35, y: 60 }, // Large center-left
  { size: 80, x: screenWidth * 0.15, y: 140 }, // Medium left
  { size: 150, x: screenWidth * 0.35, y: 230 }, // Extra large bottom-left
  { size: 120, x: screenWidth * 0.7, y: 130 }, // Large right
  { size: 75, x: screenWidth * 0.75, y: 240 }, // Medium-small bottom-right
];

const DELIVERY_ICON_SIZE = 50;
const ANIMATION_DURATION = 8000; // 8 seconds for full journey

// Calculate path points for smooth animation
const calculatePathPoints = () => {
  const points: { x: number; y: number }[] = [];
  BUBBLES.forEach((bubble) => {
    points.push({
      x: bubble.x,
      y: bubble.y,
    });
  });

  // Add final point extending to top-right for the pin icon
  points.push({
    x: screenWidth * 0.85,
    y: 40,
  });

  return points;
};

const PATH_POINTS = calculatePathPoints();

const AnimatedBubble = ({ bubble, index }: { bubble: (typeof BUBBLES)[0]; index: number }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 1200; // Each bubble appears 1.2 seconds after the previous

    scale.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) })
    );

    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, [index, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: bubble.size,
          height: bubble.size,
          borderRadius: bubble.size / 2,
          left: bubble.x - bubble.size / 2,
          top: bubble.y - bubble.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

const DottedPath = () => {
  return (
    <Svg width={screenWidth} height={320} style={styles.pathSvg}>
      {PATH_POINTS.slice(0, -1).map((point, index) => {
        const nextPoint = PATH_POINTS[index + 1];
        if (!nextPoint) return null;

        return (
          <Line
            key={`path-${index}`}
            x1={point.x}
            y1={point.y}
            x2={nextPoint.x}
            y2={nextPoint.y}
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeDasharray="12,8"
            opacity={0.9}
          />
        );
      })}
    </Svg>
  );
};

const AnimatedDeliveryIcon = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Start animation after a short delay
    progress.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.inOut(Easing.ease) }),
          withDelay(1000, withTiming(1, { duration: 0 })) // Pause at end
        ),
        -1,
        false
      )
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const totalSegments = PATH_POINTS.length - 1;
    const segmentProgress = progress.value * totalSegments;
    const currentSegment = Math.floor(segmentProgress);
    const segmentFraction = segmentProgress - currentSegment;

    const startPoint = PATH_POINTS[Math.min(currentSegment, PATH_POINTS.length - 2)];
    const endPoint = PATH_POINTS[Math.min(currentSegment + 1, PATH_POINTS.length - 1)];

    const x = startPoint.x + (endPoint.x - startPoint.x) * segmentFraction;
    const y = startPoint.y + (endPoint.y - startPoint.y) * segmentFraction;

    return {
      transform: [
        { translateX: x - DELIVERY_ICON_SIZE / 2 },
        { translateY: y - DELIVERY_ICON_SIZE / 2 },
      ],
      opacity: progress.value > 0.1 ? 1 : 0,
    };
  });

  return (
    <Animated.View style={[styles.deliveryIcon, animatedStyle]}>
      <View style={styles.pinIconContainer}>
        <MapPin size={s(28)} color="#CA251B" fill="#FFFFFF" strokeWidth={2} />
        <View style={styles.pinIconInner}>
          <Utensils size={s(14)} color="#CA251B" strokeWidth={2.5} />
        </View>
      </View>
    </Animated.View>
  );
};

const AnimatedBubblePattern = () => {
  return (
    <View style={styles.patternContainer}>
      <DottedPath />
      {BUBBLES.map((bubble, index) => (
        <AnimatedBubble key={`bubble-${index}`} bubble={bubble} index={index} />
      ))}
      <AnimatedDeliveryIcon />
    </View>
  );
};

export default function LandingScreen() {
  const navigation = useNavigation();
  const { open: openLocationOverlay } = useLocationOverlay();
  const { t } = useTranslation();
  const { locale } = useLocalization();
  const { selectedAddress } = useSelectedAddress();
  const listRef = useRef<FlatList>(null);

  const userLatitude = selectedAddress?.coordinates.latitude;
  const userLongitude = selectedAddress?.coordinates.longitude;

  const hasValidCoordinates =
    typeof userLatitude === 'number' &&
    Number.isFinite(userLatitude) &&
    typeof userLongitude === 'number' &&
    Number.isFinite(userLongitude);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery<
    PageResponse<RestaurantDisplayDto>
  >({
    queryKey: ['landing-restaurants', userLatitude, userLongitude],
    queryFn: () =>
      getNearbyRestaurantsPage({
        lat: userLatitude as number,
        lng: userLongitude as number,
        page: 0,
        pageSize: 10,
      }),
    enabled: hasValidCoordinates,
    staleTime: 60_000,
  });

  const restaurants = useMemo(() => data?.items ?? [], [data]);

  const renderRestaurantCard = useCallback(
    ({ item, index }: { item: RestaurantDisplayDto; index: number }) => {
      const delay = Math.min(index, 4) * 50;

      return (
        <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.cardWrapper}>
          <RestaurantShowcaseCard
            name={getLocalizedName(item, locale)}
            description={getLocalizedDescriptionNullable(item, locale)}
            address={item.address}
            rating={item.rating}
            type={item.type}
            imageUrl={item.imageUrl}
            fallbackImageUrl={item.iconUrl}
            openingHours={item.openingHours}
            closingHours={item.closingHours}
            estimatedDeliveryTime={item.estimatedDeliveryTime}
            width={screenWidth - s(32)}
            onPress={() =>
              navigation.navigate(
                'RestaurantDetails' as never,
                {
                  restaurantId: item.id,
                } as never
              )
            }
          />
        </Animated.View>
      );
    },
    [navigation, locale]
  );

  const renderContent = () => {
    if (!hasValidCoordinates) {
      return (
        <View style={styles.contentWrapper}>
          <AnimatedBubblePattern />
          <View style={styles.addressPrompt}>
            <Text allowFontScaling={false} style={styles.addressPromptTitle}>
              {t('home.addressPrompt.title')}
            </Text>
            <Text allowFontScaling={false} style={styles.addressPromptSubtitle}>
              {t('home.addressPrompt.subtitle')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.addressPromptButton}
              onPress={openLocationOverlay}>
              <Text allowFontScaling={false} style={styles.addressPromptButtonLabel}>
                {t('home.addressPrompt.cta')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.contentWrapper}>
          <AnimatedBubblePattern />
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text allowFontScaling={false} style={styles.loadingText}>
              {t('home.loading', 'Loading restaurants...')}
            </Text>
          </View>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.contentWrapper}>
          <AnimatedBubblePattern />
          <View style={styles.errorContent}>
            <Text allowFontScaling={false} style={styles.errorText}>
              {t('home.error.title')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.retryButton}
              onPress={() => refetch()}>
              <Text allowFontScaling={false} style={styles.retryLabel}>
                {t('home.error.action')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentWrapper}>
        <AnimatedBubblePattern />

        <View style={styles.restaurantSection}>
          <View style={styles.sectionTitleCard}>
            <Text allowFontScaling={false} style={styles.sectionTitle}>
              {t('home.sections.restaurants', 'Nearby Restaurants')}
            </Text>
          </View>

          <FlatList
            ref={listRef}
            data={restaurants}
            renderItem={renderRestaurantCard}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.restaurantList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text allowFontScaling={false} style={styles.emptyText}>
                  {t('home.empty.title')}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    );
  };

  const customHeader = (
    <Animated.View entering={FadeIn.duration(500)} style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search' as never)}>
        <Text allowFontScaling={false} style={styles.searchPlaceholder}>
          {t('home.search.prompt', 'Ready to eat?')}
        </Text>
        <Search size={s(24)} color="#666666" strokeWidth={2} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.addressButton} onPress={openLocationOverlay}>
        <Text allowFontScaling={false} style={styles.addressText}>
          {selectedAddress?.formattedAddress ?? t('home.header.chooseAddress', 'Choose Location')}
        </Text>
        <ChevronDown size={s(20)} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <MainLayout
      showHeader
      showFooter
      headerMaxHeight={vs(160)}
      headerMinHeight={vs(120)}
      customHeader={customHeader}
      onRefresh={refetch}
      isRefreshing={isRefetching}
      mainContent={<></>}
      ignoreMarginBottom
      enableHeaderCollapse={false}
      headerBackgroundImage={null}
      virtualizedListProps={{
        data: [{ key: 'content' }],
        ref: listRef as any,
        renderItem: () => renderContent(),
        keyExtractor: (item) => item.key,
        showsVerticalScrollIndicator: false,
        contentContainerStyle: styles.listContent,
        style: styles.redBackground,
      }}
    />
  );
}

const styles = ScaledSheet.create({
  redBackground: {
    backgroundColor: '#CA251B',
  },
  headerContainer: {
    paddingHorizontal: '20@s',
    paddingTop: vs(10),
    paddingBottom: vs(16),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '50@ms',
    paddingHorizontal: '20@s',
    paddingVertical: '14@vs',
    marginBottom: '16@vs',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchPlaceholder: {
    color: '#999999',
    flex: 1,
    fontSize: '16@ms',
    fontWeight: '400',
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '8@vs',
  },
  addressText: {
    color: '#FFFFFF',
    fontSize: '16@ms',
    fontWeight: '600',
    marginRight: '6@s',
  },
  listContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#CA251B',
  },
  patternContainer: {
    width: screenWidth,
    height: 320,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  pathSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryIcon: {
    position: 'absolute',
    width: DELIVERY_ICON_SIZE,
    height: DELIVERY_ICON_SIZE,
  },
  pinIconContainer: {
    width: DELIVERY_ICON_SIZE,
    height: DELIVERY_ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pinIconInner: {
    position: 'absolute',
    top: '6@vs',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressPrompt: {
    paddingVertical: '36@vs',
    paddingHorizontal: '24@s',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: '24@ms',
    borderTopRightRadius: '24@ms',
    marginTop: '-20@vs',
  },
  addressPromptTitle: {
    fontSize: '20@ms',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  addressPromptSubtitle: {
    marginTop: '10@vs',
    fontSize: '14@ms',
    color: '#64748B',
    textAlign: 'center',
  },
  addressPromptButton: {
    marginTop: '20@vs',
    paddingHorizontal: '28@s',
    paddingVertical: '12@vs',
    borderRadius: '25@ms',
    backgroundColor: '#CA251B',
  },
  addressPromptButtonLabel: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '40@vs',
    paddingHorizontal: '24@s',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: '24@ms',
    borderTopRightRadius: '24@ms',
    marginTop: '-20@vs',
    gap: '16@vs',
  },
  loadingText: {
    fontSize: '14@ms',
    color: '#64748B',
    textAlign: 'center',
  },
  errorContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '40@vs',
    paddingHorizontal: '24@s',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: '24@ms',
    borderTopRightRadius: '24@ms',
    marginTop: '-20@vs',
    gap: '16@vs',
  },
  errorText: {
    fontSize: '15@ms',
    color: '#17213A',
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#17213A',
    paddingHorizontal: '24@s',
    paddingVertical: '12@vs',
    borderRadius: '20@ms',
  },
  retryLabel: {
    color: '#FFFFFF',
    fontSize: '14@ms',
    fontWeight: '600',
  },
  restaurantSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: '24@ms',
    borderTopRightRadius: '24@ms',
    marginTop: '-20@vs',
    paddingTop: '24@vs',
  },
  sectionTitleCard: {
    paddingHorizontal: '20@s',
    paddingBottom: '16@vs',
  },
  sectionTitle: {
    fontSize: '22@ms',
    fontWeight: '700',
    color: '#17213A',
  },
  restaurantList: {
    paddingHorizontal: '16@s',
    paddingBottom: '20@vs',
  },
  cardWrapper: {
    marginBottom: '16@vs',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '40@vs',
    paddingHorizontal: '20@s',
  },
  emptyText: {
    fontSize: '15@ms',
    color: '#64748B',
    textAlign: 'center',
  },
});

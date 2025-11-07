import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { Image } from 'expo-image';
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
import Svg, { Circle, Line } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import MainLayout from '~/layouts/MainLayout';
import Header from '~/components/Header';
import RestaurantShowcaseCard from '~/components/RestaurantShowcaseCard';
import useSelectedAddress from '~/hooks/useSelectedAddress';
import useLocationOverlay from '~/hooks/useLocationOverlay';
import { useTranslation, useLocalization } from '~/localization';
import { getNearbyRestaurantsPage } from '~/api/restaurants';
import { PageResponse, RestaurantDisplayDto } from '~/interfaces/Restaurant';
import { getLocalizedName, getLocalizedDescriptionNullable } from '~/utils/localization';

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;

// Bubble configuration - 3 big, 2 small
const BUBBLES = [
  { size: 80, x: screenWidth * 0.15, y: 60 }, // Big
  { size: 50, x: screenWidth * 0.45, y: 30 }, // Small
  { size: 90, x: screenWidth * 0.75, y: 70 }, // Big
  { size: 60, x: screenWidth * 0.55, y: 150 }, // Small
  { size: 85, x: screenWidth * 0.25, y: 180 }, // Big
];

const DELIVERY_ICON_SIZE = 40;
const ANIMATION_DURATION = 8000; // 8 seconds for full journey

// Calculate path points for smooth animation
const calculatePathPoints = () => {
  const points: { x: number; y: number }[] = [];
  BUBBLES.forEach((bubble, index) => {
    points.push({
      x: bubble.x,
      y: bubble.y,
    });
  });

  // Add final point extending past the last bubble
  const lastBubble = BUBBLES[BUBBLES.length - 1];
  points.push({
    x: lastBubble.x + 100,
    y: lastBubble.y + 50,
  });

  return points;
};

const PATH_POINTS = calculatePathPoints();

const AnimatedBubble = ({ bubble, index }: { bubble: (typeof BUBBLES)[0]; index: number }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 1500; // Each bubble appears 1.5 seconds after the previous

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

  const bubbleColor = index % 2 === 0 ? '#CA251B' : '#17213A';
  const innerColor = index % 2 === 0 ? 'rgba(202, 37, 27, 0.3)' : 'rgba(23, 33, 58, 0.3)';

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
          backgroundColor: bubbleColor,
        },
        animatedStyle,
      ]}>
      <View
        style={[
          styles.bubbleInner,
          {
            width: bubble.size * 0.6,
            height: bubble.size * 0.6,
            borderRadius: (bubble.size * 0.6) / 2,
            backgroundColor: innerColor,
          },
        ]}
      />
    </Animated.View>
  );
};

const DottedPath = () => {
  return (
    <Svg width={screenWidth} height={250} style={styles.pathSvg}>
      {PATH_POINTS.slice(0, -1).map((point, index) => {
        const nextPoint = PATH_POINTS[index + 1];
        if (!nextPoint) return null;

        const midX = (point.x + nextPoint.x) / 2;
        const midY = (point.y + nextPoint.y) / 2;

        return (
          <React.Fragment key={`path-${index}`}>
            <Line
              x1={point.x}
              y1={point.y}
              x2={midX}
              y2={midY}
              stroke="#CA251B"
              strokeWidth="3"
              strokeDasharray="8,8"
              opacity={0.6}
            />
            <Circle cx={midX} cy={midY} r="3" fill="#CA251B" opacity={0.8} />
            <Line
              x1={midX}
              y1={midY}
              x2={nextPoint.x}
              y2={nextPoint.y}
              stroke="#CA251B"
              strokeWidth="3"
              strokeDasharray="8,8"
              opacity={0.6}
            />
          </React.Fragment>
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

    // Calculate rotation based on direction
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const rotation = (angle * 180) / Math.PI;

    return {
      transform: [
        { translateX: x - DELIVERY_ICON_SIZE / 2 },
        { translateY: y - DELIVERY_ICON_SIZE / 2 },
        { rotate: `${rotation}deg` },
      ],
      opacity: progress.value > 0 ? 1 : 0,
    };
  });

  return (
    <Animated.View style={[styles.deliveryIcon, animatedStyle]}>
      <Image
        source={require('../../assets/delivery.png')}
        style={{ width: DELIVERY_ICON_SIZE, height: DELIVERY_ICON_SIZE }}
        contentFit="contain"
      />
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
      const delay = Math.min(index, 6) * 70;

      return (
        <Animated.View entering={FadeInDown.delay(delay).duration(450)} style={styles.carouselItem}>
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
            width={screenWidth * 0.85}
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
        <Animated.View entering={FadeIn.duration(500)} style={styles.placeholderContainer}>
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
        </Animated.View>
      );
    }

    if (isLoading) {
      return (
        <Animated.View entering={FadeIn.duration(500)} style={styles.loadingContainer}>
          <AnimatedBubblePattern />
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#CA251B" />
            <Text allowFontScaling={false} style={styles.loadingText}>
              {t('home.loading', 'Loading restaurants...')}
            </Text>
          </View>
        </Animated.View>
      );
    }

    if (isError) {
      return (
        <Animated.View entering={FadeIn.duration(500)} style={styles.errorContainer}>
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
        </Animated.View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <AnimatedBubblePattern />

        <View style={styles.carouselSection}>
          <Text allowFontScaling={false} style={styles.sectionTitle}>
            {t('home.sections.restaurants', 'Discover Restaurants')}
          </Text>

          <FlatList
            ref={listRef}
            data={restaurants}
            renderItem={renderRestaurantCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={screenWidth * 0.85 + 16}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
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
    <Animated.View entering={FadeIn.duration(500)}>
      <View style={styles.headerWrapper}>
        <Header
          title={t('home.header.chooseAddress')}
          onBack={() => console.log('Landing screen - no back navigation')}
          compact
        />
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search' as never)}>
          <Text allowFontScaling={false} style={styles.searchPlaceholder}>
            {t('home.search.prompt')}
          </Text>
          <Search size={s(18)} color="black" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <MainLayout
      headerBackgroundImage={require('../../assets/pattern1.png')}
      showHeader
      showFooter
      headerMaxHeight={vs(140)}
      headerMinHeight={vs(100)}
      customHeader={customHeader}
      onRefresh={refetch}
      isRefreshing={isRefetching}
      mainContent={<></>}
      ignoreMarginBottom
      virtualizedListProps={{
        data: [{ key: 'content' }],
        ref: listRef as any,
        renderItem: () => renderContent(),
        keyExtractor: (item) => item.key,
        showsVerticalScrollIndicator: false,
        contentContainerStyle: styles.listContent,
      }}
    />
  );
}

const styles = ScaledSheet.create({
  headerWrapper: {
    padding: '6@s',
    paddingTop: screenHeight < 700 ? vs(0) : vs(6),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '12@ms',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginTop: '6@vs',
  },
  searchPlaceholder: {
    color: 'gray',
    flex: 1,
    fontSize: '13@ms',
  },
  listContent: {
    paddingBottom: '32@vs',
  },
  patternContainer: {
    width: screenWidth,
    height: 250,
    marginVertical: '16@vs',
    position: 'relative',
  },
  pathSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bubble: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  bubbleInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryIcon: {
    position: 'absolute',
    width: DELIVERY_ICON_SIZE,
    height: DELIVERY_ICON_SIZE,
  },
  placeholderContainer: {
    flex: 1,
    paddingHorizontal: '16@s',
  },
  addressPrompt: {
    paddingVertical: '36@vs',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '16@s',
  },
  addressPromptTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  addressPromptSubtitle: {
    marginTop: '8@vs',
    fontSize: '13@ms',
    color: '#64748B',
    textAlign: 'center',
  },
  addressPromptButton: {
    marginTop: '18@vs',
    paddingHorizontal: '20@s',
    paddingVertical: '10@vs',
    borderRadius: '20@ms',
    backgroundColor: '#CA251B',
  },
  addressPromptButtonLabel: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    paddingHorizontal: '16@s',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '40@vs',
    gap: '16@vs',
  },
  loadingText: {
    fontSize: '14@ms',
    color: '#64748B',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    paddingHorizontal: '16@s',
  },
  errorContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '40@vs',
    gap: '16@vs',
  },
  errorText: {
    fontSize: '14@ms',
    color: '#17213A',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#17213A',
    paddingHorizontal: '20@s',
    paddingVertical: '10@vs',
    borderRadius: '18@ms',
  },
  retryLabel: {
    color: '#FFFFFF',
    fontSize: '13@ms',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: '16@s',
  },
  carouselSection: {
    marginTop: '16@vs',
  },
  sectionTitle: {
    fontSize: '20@ms',
    fontWeight: '700',
    color: '#17213A',
    marginBottom: '16@vs',
  },
  carouselContent: {
    paddingVertical: '8@vs',
  },
  carouselItem: {
    marginRight: '16@s',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '40@vs',
    paddingHorizontal: '16@s',
  },
  emptyText: {
    fontSize: '14@ms',
    color: '#64748B',
    textAlign: 'center',
  },
});

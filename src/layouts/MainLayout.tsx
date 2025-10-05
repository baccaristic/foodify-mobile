import { Home, Search, ShoppingBag, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Platform,
  RefreshControl,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  Extrapolation,
  withTiming,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { ScaledSheet, s, vs, ms } from 'react-native-size-matters';
import { Image } from 'expo-image';
import OngoingOrderBanner from '~/components/OngoingOrderBanner';

type NavItem = {
  icon: LucideIcon;
  label: string;
  route: string;
};

const defaultNavItems: NavItem[] = [
  { icon: Home, label: 'Home', route: 'Home' },
  { icon: Search, label: 'Search', route: 'Search' },
  { icon: ShoppingBag, label: 'Orders', route: 'Cart' },
  { icon: User, label: 'Account', route: 'Profile' },
];

const useOptionalNavigation = () => {
  try {
    return useNavigation<NavigationProp<Record<string, object | undefined>>>();
  } catch (error) {
    return undefined;
  }
};

const useOptionalRoute = () => {
  try {
    return useRoute();
  } catch (error) {
    return undefined;
  }
};

interface MainLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;
  customHeader?: ReactNode;
  collapsedHeader?: ReactNode;
  mainContent: ReactNode;
  floatingContent?: ReactNode;
  headerMaxHeight?: number;
  headerMinHeight?: number;
  headerBackgroundImage?: any;
  headerCollapsed?: boolean;
  enableHeaderCollapse?: boolean;
  enforceResponsiveHeaderSize?: boolean;
  navItems?: NavItem[];
  activeTab?: string;
  onTabPress?: (route: string) => void;
  onRefresh?: () => void | Promise<any>;
  isRefreshing?: boolean;
  showOngoingOrderBanner?: boolean;
}

export default function MainLayout({
  showHeader = true,
  showFooter = true,
  customHeader,
  collapsedHeader,
  mainContent,
  floatingContent,
  headerMaxHeight,
  headerMinHeight,
  headerBackgroundImage,
  headerCollapsed = false,
  enableHeaderCollapse = true,
  enforceResponsiveHeaderSize = true,
  navItems,
  activeTab,
  onTabPress,
  onRefresh,
  isRefreshing,
  showOngoingOrderBanner = true,
}: MainLayoutProps) {
  const screenHeight = Dimensions.get('screen').height;
  const insets = useSafeAreaInsets();
  const defaultMax = screenHeight * 0.28;
  const minResponsiveMax = screenHeight * 0.2;
  const rawMaxHeight = headerMaxHeight ?? defaultMax;
  const rawMinHeight = headerMinHeight ?? screenHeight * 0.12;

  let MAX_HEIGHT = rawMaxHeight;
  let MIN_HEIGHT = rawMinHeight;

  if (enforceResponsiveHeaderSize) {
    MAX_HEIGHT = Math.max(rawMaxHeight, minResponsiveMax);
    MIN_HEIGHT = Math.max(rawMinHeight, screenHeight * 0.12);
  }

  if (MAX_HEIGHT < MIN_HEIGHT) {
    MAX_HEIGHT = MIN_HEIGHT;
  }

  const SCROLL_DISTANCE = Math.max(MAX_HEIGHT - MIN_HEIGHT, 0) + insets.top;
  const collapseEnabled = enableHeaderCollapse && showHeader;

  const navigation = useOptionalNavigation();
  const route = useOptionalRoute();
  const scrollY = useSharedValue(0);
  const [activeHeader, setActiveHeader] = useState<'full' | 'collapsed'>(
    collapseEnabled && headerCollapsed ? 'collapsed' : 'full'
  );

  const scrollHandler = useAnimatedScrollHandler((event) => {
    if (!collapseEnabled) {
      return;
    }
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    if (!collapseEnabled) {
      setActiveHeader('full');
      return;
    }
    setActiveHeader(headerCollapsed ? 'collapsed' : 'full');
  }, [collapseEnabled, headerCollapsed]);

  const updateActiveHeader = useCallback((next: 'full' | 'collapsed') => {
    setActiveHeader((previous) => (previous === next ? previous : next));
  }, []);

  useAnimatedReaction(
    () => (collapseEnabled ? scrollY.value : -1),
    (current, previous) => {
      if (!collapseEnabled) {
        return;
      }

      const wasCollapsed = typeof previous === 'number' ? previous >= SCROLL_DISTANCE / 2 : undefined;
      const isCollapsed = current >= SCROLL_DISTANCE / 2;

      if (wasCollapsed === isCollapsed) {
        return;
      }

      runOnJS(updateActiveHeader)(isCollapsed ? 'collapsed' : 'full');
    },
    [collapseEnabled, SCROLL_DISTANCE, updateActiveHeader]
  );

  const fullHeaderPointerEvents: 'auto' | 'none' =
    !collapseEnabled || activeHeader === 'full' ? 'auto' : 'none';

  const collapsedHeaderPointerEvents: 'auto' | 'none' =
    collapseEnabled && activeHeader === 'collapsed' ? 'auto' : 'none';

  useEffect(() => {
    if (!collapseEnabled) {
      return;
    }
    scrollY.value = withTiming(headerCollapsed ? SCROLL_DISTANCE : 0, { duration: 350 });
  }, [collapseEnabled, headerCollapsed, SCROLL_DISTANCE, scrollY]);

  const fullHeaderStyle = useAnimatedStyle(() => {
    if (!collapseEnabled) {
      return { opacity: 1 };
    }
    const opacity = interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolate.CLAMP);
    return { opacity };
  });

  const collapsedHeaderStyle = useAnimatedStyle(() => {
    if (!collapseEnabled) {
      return { opacity: 0 };
    }
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_DISTANCE / 2, SCROLL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const headerHeightStyle = useAnimatedStyle(() => {
    if (!collapseEnabled) {
      return { height: MAX_HEIGHT + 20 };
    }
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [MAX_HEIGHT, MIN_HEIGHT],
      Extrapolate.CLAMP
    );
    return { height: height + 20 };
  });

  const renderHeaderContent = (isAnimated: boolean) => {
    if (!customHeader && !collapsedHeader && !headerBackgroundImage) {
      return null;
    }

    const fullNode = customHeader
      ? isAnimated
        ? (
            <Animated.View style={fullHeaderStyle} pointerEvents={fullHeaderPointerEvents}>
              {customHeader}
            </Animated.View>
          )
        : (
            <View style={{ flex: 1 }}>{customHeader}</View>
          )
      : null;

    const collapsedNode =
      isAnimated && collapseEnabled && collapsedHeader ? (
        <Animated.View
          style={[styles.collapsedHeader, collapsedHeaderStyle]}
          pointerEvents={collapsedHeaderPointerEvents}
        >
          {collapsedHeader}
        </Animated.View>
      ) : null;

    if (headerBackgroundImage) {
      return (
        <ImageBackground
          source={headerBackgroundImage}
          style={{ flex: 1, width: '100%', height: '100%' }}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          {fullNode}
          {collapsedNode}
        </ImageBackground>
      );
    }

    return (
      <>
        {fullNode}
        {collapsedNode}
      </>
    );
  };

  const refreshControl = onRefresh
    ? (
        <RefreshControl
          refreshing={Boolean(isRefreshing)}
          onRefresh={() => {
            const result = onRefresh();
            if (result instanceof Promise) {
              result.catch((error) => console.warn('Refresh failed', error));
            }
          }}
          tintColor="#CA251B"
          colors={['#CA251B']}
        />
      )
    : undefined;

  const resolvedNavItems = navItems ?? defaultNavItems;
  const routeName = route?.name;
  const resolvedActiveTab = activeTab ?? (routeName && resolvedNavItems.find((item) => item.route === routeName) ? routeName : undefined);

  const headerNode = !showHeader
    ? null
    : collapseEnabled
    ? (
        <Animated.View style={[headerHeightStyle, { width: '100%', overflow: 'hidden' }]}>
          {renderHeaderContent(true)}
        </Animated.View>
      )
    : (
        <View style={{ width: '100%', overflow: 'hidden', height: MAX_HEIGHT + 20 }}>
          {renderHeaderContent(false)}
        </View>
      );

  const [bannerHeight, setBannerHeight] = useState(0);

  const handleBannerLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent?.layout?.height ?? 0;
    if (!Number.isFinite(nextHeight)) {
      return;
    }
    setBannerHeight((current) => {
      if (Math.abs(current - nextHeight) <= 1) {
        return current;
      }
      return nextHeight;
    });
  }, []);

  const baseBottomInset = useMemo(
    () => (showFooter ? insets.bottom + vs(84) : insets.bottom + vs(24)),
    [insets.bottom, showFooter]
  );

  const bannerSpacing = showOngoingOrderBanner ? vs(6) : 0;

  const floatingBottomInset = useMemo(() => {
    if (!showOngoingOrderBanner) {
      return baseBottomInset;
    }
    return baseBottomInset + bannerSpacing + bannerHeight;
  }, [baseBottomInset, bannerHeight, bannerSpacing, showOngoingOrderBanner]);

  return (
    <SafeAreaView style={styles.container}>
      {headerNode}

      <Animated.ScrollView
        style={[styles.scrollView]}
        contentContainerStyle={{
          paddingTop: collapseEnabled ? vs(10) : vs(20),
          paddingBottom: showFooter ? vs(80) : vs(20),
        }}
        refreshControl={refreshControl}
        scrollEventThrottle={16}
        onScroll={collapseEnabled ? scrollHandler : undefined}>
        <View style={styles.mainContent}>{mainContent}</View>
      </Animated.ScrollView>

      {floatingContent ? (
        <View
          style={[
            styles.floatingSlot,
            { bottom: floatingBottomInset },
          ]}
          pointerEvents="box-none">
          {floatingContent}
        </View>
      ) : null}

      {showOngoingOrderBanner ? (
        <View
          style={[styles.bannerSlot, { bottom: baseBottomInset + bannerSpacing }]}
          pointerEvents="box-none"
          onLayout={handleBannerLayout}>
          <OngoingOrderBanner placement="inline" />
        </View>
      ) : null}

      {showFooter && (
        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          <View style={styles.navRow}>
            {resolvedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = resolvedActiveTab === item.route;
              const color = isActive ? '#CA251B' : '#D9D9D9';

              const handlePress = () => {
                if (onTabPress) {
                  onTabPress(item.route);
                  return;
                }
                if (!navigation || item.route === routeName) {
                  return;
                }
                navigation.navigate(item.route as never);
              };

              return (
                <TouchableOpacity key={item.route} activeOpacity={0.7} style={styles.navButton} onPress={handlePress}>
                  <Icon size={s(22)} color={color} />
                  <Text allowFontScaling={false} style={[styles.navLabel, { color }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(202, 37, 27, 0.85)',
  },
  collapsedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: '24@ms',
    borderTopRightRadius: '24@ms',
    marginTop: '-14@vs',
    zIndex: 1,
  },
  staticScrollView: {
    marginTop: 0,
  },
  mainContent: {
    flex: 1,
  },
  floatingSlot: {
    position: 'absolute',
    left: '0@s',
    right: '0@s',
    paddingHorizontal: '16@s',
    zIndex: 3,
  },
  bannerSlot: {
    position: 'absolute',
    left: '0@s',
    right: '0@s',
    paddingHorizontal: '16@s',
    zIndex: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#17213A',
    paddingVertical: '10@vs',
    paddingHorizontal: '24@s',
    borderTopLeftRadius: '24@ms',
    borderTopRightRadius: '24@ms',
    zIndex: 2,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    padding: '4@s',
  },
  navLabel: {
    fontSize: '11@ms',
    fontWeight: '500',
    marginTop: '2@vs',
  },
});





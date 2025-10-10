import { ChevronDown, ChevronUp, Home, Search, ShoppingBag, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import {
  MutableRefObject,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import type { ScrollView } from 'react-native';
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
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import useOngoingOrder from '~/hooks/useOngoingOrder';
import { formatOrderStatusLabel } from '~/utils/order';

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
  } catch (_error) {
    return undefined;
  }
};

const useOptionalRoute = () => {
  try {
    return useRoute();
  } catch (_error) {
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
  showOnGoingOrder?: boolean;
  onScrollOffsetChange?: (offsetY: number) => void;
  scrollRef?: MutableRefObject<ScrollView | null> | null;
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
  showOnGoingOrder = true,
  onScrollOffsetChange,
  scrollRef,
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
  const { order: ongoingOrder } = useOngoingOrder();
  const [isOngoingExpanded, setIsOngoingExpanded] = useState(false);
  const scrollY = useSharedValue(0);
  const overscroll = useSharedValue(0);
  const pendingScrollOffset = useSharedValue(0);
  const [activeHeader, setActiveHeader] = useState<'full' | 'collapsed'>(
    collapseEnabled && headerCollapsed ? 'collapsed' : 'full'
  );

  const shouldNotifyScroll = typeof onScrollOffsetChange === 'function';
  const needsScrollHandling = collapseEnabled || shouldNotifyScroll;

  const onScrollOffsetChangeRef = useRef<typeof onScrollOffsetChange>();
  const pendingOffsetFrameRef = useRef<number | null>(null);
  const latestOffsetRef = useRef(0);

  useEffect(() => {
    onScrollOffsetChangeRef.current = onScrollOffsetChange;
  }, [onScrollOffsetChange]);

  useEffect(
    () => () => {
      if (pendingOffsetFrameRef.current != null) {
        if (typeof cancelAnimationFrame === 'function') {
          cancelAnimationFrame(pendingOffsetFrameRef.current);
        }
        pendingOffsetFrameRef.current = null;
      }
    },
    []
  );

  const flushPendingOffset = useCallback(() => {
    pendingOffsetFrameRef.current = null;
    const callback = onScrollOffsetChangeRef.current;
    if (callback) {
      callback(latestOffsetRef.current);
    }
  }, []);

  const scheduleOffsetNotification = useCallback((offset: number) => {
    latestOffsetRef.current = offset;
    if (pendingOffsetFrameRef.current != null) {
      return;
    }

    if (typeof requestAnimationFrame === 'function') {
      pendingOffsetFrameRef.current = requestAnimationFrame(flushPendingOffset);
      return;
    }

    flushPendingOffset();
  }, [flushPendingOffset]);

  const scrollHandler = useAnimatedScrollHandler(
    (event) => {
      const offsetY = event.contentOffset.y;
      scrollY.value = offsetY;
      overscroll.value = offsetY < 0 ? -offsetY : 0;

      if (shouldNotifyScroll) {
        pendingScrollOffset.value = offsetY;
      }
    },
    [shouldNotifyScroll]
  );

  useEffect(() => {
    if (!collapseEnabled) {
      setActiveHeader('full');
      return;
    }
    setActiveHeader(headerCollapsed ? 'collapsed' : 'full');
  }, [collapseEnabled, headerCollapsed]);

  useEffect(() => {
    if (!ongoingOrder) {
      setIsOngoingExpanded(false);
    }
  }, [ongoingOrder]);

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

  useAnimatedReaction(
    () => (shouldNotifyScroll ? pendingScrollOffset.value : null),
    (current, previous) => {
      if (current == null || current === previous) {
        return;
      }

      if (previous != null && Math.abs(current - previous) < 0.5) {
        return;
      }

      runOnJS(scheduleOffsetNotification)(current);
    },
    [shouldNotifyScroll, scheduleOffsetNotification]
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
    const extra = overscroll.value;

    if (!collapseEnabled) {
      return { height: MAX_HEIGHT + extra + 20 };
    }

    const height = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [MAX_HEIGHT, MIN_HEIGHT],
      Extrapolate.CLAMP
    );

    return { height: height + extra + 20 };
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

  const defaultFooterHeight = vs(80);
  const collapsedOngoingHeight = vs(120);
  const expandedOngoingHeight = vs(160);
  const resolvedFooterHeight = !showFooter
    ? 0
    : ongoingOrder
    ? isOngoingExpanded
      ? expandedOngoingHeight
      : collapsedOngoingHeight
    : defaultFooterHeight;
  const fallbackContentPadding = vs(20);
  const floatingBottomOffset = showFooter
    ? insets.bottom + resolvedFooterHeight + vs(4)
    : insets.bottom + vs(24);

  const ongoingStatusLabel = useMemo(() => {
    if (!ongoingOrder) {
      return null;
    }

    const history = ongoingOrder.statusHistory ?? [];
    if (history.length) {
      const lastEntry = history[history.length - 1];
      const label = formatOrderStatusLabel(lastEntry?.newStatus ?? null);
      if (label) {
        return label;
      }
    }

    return formatOrderStatusLabel(ongoingOrder.status ?? null);
  }, [ongoingOrder]);

  const handleToggleOngoing = useCallback(() => {
    setIsOngoingExpanded((previous) => !previous);
  }, []);

  const handleViewOrderDetails = useCallback(() => {
    if (!ongoingOrder) {
      return;
    }

    const params = {
      order: ongoingOrder as any,
      orderId: ongoingOrder.orderId ?? null,
    };

    if (navigation) {
      navigation.navigate('OrderTracking' as never, params as never);
    }
  }, [navigation, ongoingOrder]);

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

  const setScrollViewRef = useCallback(
    (node: ScrollView | null) => {
      if (scrollRef) {
        scrollRef.current = node;
      }
    },
    [scrollRef]
  );

  return (
    <SafeAreaView style={styles.container}>
      {headerNode}

      <Animated.ScrollView
        ref={setScrollViewRef}
        style={[styles.scrollView]}
        contentContainerStyle={{
          paddingTop: collapseEnabled ? vs(10) : vs(20),
          paddingBottom: showFooter ? resolvedFooterHeight : fallbackContentPadding,
        }}
        refreshControl={refreshControl}
        scrollEventThrottle={16}
        alwaysBounceVertical
        bounces
        overScrollMode="always"
        onScroll={needsScrollHandling ? scrollHandler : undefined}>
        <View style={styles.mainContent}>{mainContent}</View>
      </Animated.ScrollView>

      {floatingContent ? (
        <View
          style={[
            styles.floatingSlot,
            { bottom: floatingBottomOffset },
          ]}
          pointerEvents="box-none">
          {floatingContent}
        </View>
      ) : null}

      {showFooter && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + vs(10) }]}>
          {ongoingOrder && showOnGoingOrder ? (
            <OngoingOrderSection
              isExpanded={isOngoingExpanded}
              onToggle={handleToggleOngoing}
              statusLabel={ongoingStatusLabel ?? 'Tracking...'}
              onPressDetails={handleViewOrderDetails}
            />
          ) : null}
          <View style={[styles.navRow, ongoingOrder ? styles.navRowWithBanner : null]}>
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

interface OngoingOrderSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
  statusLabel: string;
  onPressDetails: () => void;
}

const OngoingOrderSection = ({
  isExpanded,
  onToggle,
  statusLabel,
  onPressDetails,
}: OngoingOrderSectionProps) => {
  return (
    <View style={styles.ongoingContainer}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggle}
        style={styles.ongoingHeader}
      >
        <Text allowFontScaling={false} style={styles.ongoingHeaderText} numberOfLines={1}>
          your order is on the way
        </Text>
        {isExpanded ? (
          <ChevronDown size={s(18)} color="#FFFFFF" />
        ) : (
          <ChevronUp size={s(18)} color="#FFFFFF" />
        )}
      </TouchableOpacity>
      {isExpanded ? (
        <View style={styles.ongoingBody}>
          <View style={styles.statusCard}>
            <Text allowFontScaling={false} style={styles.statusCardLabel}>
              Status
            </Text>
            <Text allowFontScaling={false} style={styles.statusCardValue} numberOfLines={2}>
              {statusLabel}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.detailsButton}
            onPress={onPressDetails}
          >
            <Text allowFontScaling={false} style={styles.detailsButtonLabel}>
              See Details
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

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
  ongoingContainer: {
    width: '100%',
    borderRadius: '18@ms',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#243255',
    paddingVertical: '12@vs',
    paddingHorizontal: '18@s',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: '12@vs',
  },
  ongoingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ongoingHeaderText: {
    color: '#FFFFFF',
    fontSize: '14@ms',
    fontWeight: '600',
  },
  ongoingBody: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: '12@vs',
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#CA251B',
    borderRadius: '16@ms',
    paddingVertical: '12@vs',
    paddingHorizontal: '14@s',
    marginRight: '12@s',
  },
  statusCardLabel: {
    color: '#FFFFFF',
    fontSize: '13@ms',
    fontWeight: '700',
  },
  statusCardValue: {
    color: '#FFFFFF',
    fontSize: '12@ms',
    marginTop: '4@vs',
    fontWeight: '500',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#CA251B',
    borderRadius: '16@ms',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '14@vs',
    paddingHorizontal: '12@s',
  },
  detailsButtonLabel: {
    color: '#FFFFFF',
    fontSize: '14@ms',
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navRowWithBanner: {
    marginTop: '16@vs',
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





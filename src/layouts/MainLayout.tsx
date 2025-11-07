import {
  ChevronDown,
  ChevronUp,
  Home,
  Search,
  ShoppingBag,
  User,
  Package,
  Clock,
  MapPin,
  X,
  ChevronRight,
} from 'lucide-react-native';
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
import type { FlatList as RNFlatList, FlatListProps, ScrollView } from 'react-native';
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
  withRepeat,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { ScaledSheet, moderateScale, s, vs } from 'react-native-size-matters';
import useOngoingOrder from '~/hooks/useOngoingOrder';
import { formatOrderStatusLabel } from '~/utils/order';
import { useTranslation } from '~/localization';

type NavItem = {
  icon: LucideIcon;
  label: string;
  route: string;
};

const useOptionalNavigation = () => {
  try {
    return useNavigation<NavigationProp<Record<string, object | undefined>>>();
  } catch {
    return undefined;
  }
};

const useOptionalRoute = () => {
  try {
    return useRoute();
  } catch {
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
  scrollRef?: MutableRefObject<ScrollView | RNFlatList<any> | null> | null;
  virtualizedListProps?: Animated.AnimatedProps<FlatListProps<any>> | null;
  ignoreMarginBottom?: boolean;
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
  virtualizedListProps = null,
  ignoreMarginBottom = false,
}: MainLayoutProps) {
  const { t } = useTranslation();
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

  const scheduleOffsetNotification = useCallback(
    (offset: number) => {
      latestOffsetRef.current = offset;
      if (pendingOffsetFrameRef.current != null) {
        return;
      }

      if (typeof requestAnimationFrame === 'function') {
        pendingOffsetFrameRef.current = requestAnimationFrame(flushPendingOffset);
        return;
      }

      flushPendingOffset();
    },
    [flushPendingOffset]
  );

  const scrollHandler = useAnimatedScrollHandler(
    (event) => {
      const offsetY = event.contentOffset.y;
      scrollY.value = offsetY;

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

      const wasCollapsed =
        typeof previous === 'number' ? previous >= SCROLL_DISTANCE / 2 : undefined;
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

    const fullNode = customHeader ? (
      isAnimated ? (
        <Animated.View style={fullHeaderStyle} pointerEvents={fullHeaderPointerEvents}>
          {customHeader}
        </Animated.View>
      ) : (
        <View style={{ flex: 1 }}>{customHeader}</View>
      )
    ) : null;

    const collapsedNode =
      isAnimated && collapseEnabled && collapsedHeader ? (
        <Animated.View
          style={[styles.collapsedHeader, collapsedHeaderStyle]}
          pointerEvents={collapsedHeaderPointerEvents}>
          {collapsedHeader}
        </Animated.View>
      ) : null;

    if (headerBackgroundImage) {
      return (
        <ImageBackground
          source={headerBackgroundImage}
          style={{ flex: 1, width: '100%', height: '100%' }}
          resizeMode="cover">
          <View style={styles.overlay} />
          {fullNode}
          {collapsedNode}
        </ImageBackground>
      );
    }

    // Solid color background when no image
    return (
      <View style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#CA251B' }}>
        {fullNode}
        {collapsedNode}
      </View>
    );
  };

  const refreshControl = onRefresh ? (
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
  ) : undefined;

  const fallbackNavItems = useMemo<NavItem[]>(
    () => [
      { icon: Home, label: t('navigation.home'), route: 'Landing' },
      { icon: Search, label: t('navigation.search'), route: 'Search' },
      { icon: ShoppingBag, label: t('navigation.cart'), route: 'Cart' },
      { icon: User, label: t('navigation.profile'), route: 'Profile' },
    ],
    [t]
  );

  const resolvedNavItems = navItems ?? fallbackNavItems;
  const routeName = route?.name;
  const resolvedActiveTab =
    activeTab ??
    (routeName && resolvedNavItems.find((item) => item.route === routeName)
      ? routeName
      : undefined);

  const defaultFooterHeight = vs(80);
  const resolvedFooterHeight = defaultFooterHeight;
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

  const handleDismissOngoing = useCallback(() => {
    setIsOngoingExpanded(false);
  }, []);

  const headerNode = !showHeader ? null : collapseEnabled ? (
    <Animated.View style={[headerHeightStyle, { width: '100%', overflow: 'hidden' }]}>
      {renderHeaderContent(true)}
    </Animated.View>
  ) : (
    <View style={{ width: '100%', overflow: 'hidden', height: MAX_HEIGHT + 20 }}>
      {renderHeaderContent(false)}
    </View>
  );

  const setScrollViewRef = useCallback(
    (node: ScrollView | RNFlatList<any> | null) => {
      if (scrollRef) {
        scrollRef.current = node;
      }
    },
    [scrollRef]
  );

  const isVirtualized = Boolean(virtualizedListProps);

  const resolvedContentContainerStyle = useMemo(() => {
    const paddingStyle = {
      paddingTop: collapseEnabled ? vs(10) : vs(20),
      paddingBottom: showFooter ? resolvedFooterHeight : fallbackContentPadding,
    };

    if (!isVirtualized) {
      return paddingStyle;
    }

    const userContentStyle = virtualizedListProps?.contentContainerStyle;

    if (Array.isArray(userContentStyle)) {
      return [paddingStyle, ...userContentStyle];
    }

    if (userContentStyle) {
      return [paddingStyle, userContentStyle];
    }

    return paddingStyle;
  }, [
    collapseEnabled,
    fallbackContentPadding,
    isVirtualized,
    resolvedFooterHeight,
    showFooter,
    virtualizedListProps,
  ]);

  const renderScrollComponent = () => {
    if (isVirtualized) {
      const {
        contentContainerStyle: _ignored,
        style: userStyle,
        ...restVirtualizedProps
      } = virtualizedListProps ?? {};

      return (
        <Animated.FlatList
          ref={setScrollViewRef}
          {...restVirtualizedProps}
          style={[styles.scrollView, userStyle]}
          contentContainerStyle={
            resolvedContentContainerStyle as FlatListProps<any>['contentContainerStyle']
          }
          refreshControl={refreshControl}
          scrollEventThrottle={16}
          onScroll={needsScrollHandling ? scrollHandler : restVirtualizedProps?.onScroll}
        />
      );
    }

    return (
      <Animated.ScrollView
        ref={setScrollViewRef}
        style={[styles.scrollView, { marginBottom: moderateScale(ignoreMarginBottom ? 0 : 88) }]}
        contentContainerStyle={resolvedContentContainerStyle}
        refreshControl={refreshControl}
        scrollEventThrottle={16}
        onScroll={needsScrollHandling ? scrollHandler : undefined}>
        <View style={styles.mainContent}>{mainContent}</View>
      </Animated.ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {headerNode}

      {renderScrollComponent()}

      {floatingContent ? (
        <View
          style={[styles.floatingSlot, { bottom: floatingBottomOffset }]}
          pointerEvents="box-none">
          {floatingContent}
        </View>
      ) : null}

      {ongoingOrder && showOnGoingOrder && showFooter ? (
        <OngoingOrderFloatingBanner
          isExpanded={isOngoingExpanded}
          onToggle={handleToggleOngoing}
          onDismiss={handleDismissOngoing}
          statusLabel={ongoingStatusLabel ?? t('layout.ongoingOrder.trackingFallback')}
          onPressDetails={handleViewOrderDetails}
          title={t('layout.ongoingOrder.bannerTitle')}
          detailsLabel={t('layout.ongoingOrder.seeDetails')}
          bottomOffset={insets.bottom + defaultFooterHeight + vs(16)}
          orderStatus={ongoingOrder.status}
        />
      ) : null}

      {showFooter && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + vs(10) }]}>
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
                <TouchableOpacity
                  key={item.route}
                  activeOpacity={0.7}
                  style={styles.navButton}
                  onPress={handlePress}>
                  <Icon size={s(22)} color={color} />
                  <Text allowFontScaling={false} style={[styles.navLabel, { color }]}>
                    {item.label}
                  </Text>
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
  title: string;
  detailsLabel: string;
}

interface OngoingOrderFloatingBannerProps {
  isExpanded: boolean;
  onToggle: () => void;
  onDismiss: () => void;
  statusLabel: string;
  onPressDetails: () => void;
  title: string;
  detailsLabel: string;
  bottomOffset: number;
  orderStatus?: string | null;
}

// Constants defined outside component to avoid recreation on every render
const EXPANDED_BODY_HEIGHT = vs(72);
const PULSE_DURATION = 1500;
const MIN_PULSE_OPACITY = 0.6;
const MAX_PULSE_OPACITY = 1;
const EXPAND_ANIMATION_DURATION = 300;
const PROGRESS_BAR_ANIMATION_DURATION = 800;

// Order status progress mapping
const getOrderProgress = (status: string | null | undefined): number => {
  if (!status) return 0;
  const upperStatus = status.toUpperCase();

  // Map statuses to progress (0-3)
  if (upperStatus === 'PENDING' || upperStatus === 'ACCEPTED') return 1;
  if (upperStatus === 'PREPARING' || upperStatus === 'READY_FOR_PICK_UP') return 2;
  if (upperStatus === 'IN_DELIVERY') return 3;
  if (upperStatus === 'DELIVERED') return 3; // Complete

  return 0;
};

// Floating banner that slides in from the right
const OngoingOrderFloatingBanner = ({
  isExpanded,
  onToggle,
  onDismiss,
  statusLabel,
  onPressDetails,
  title,
  detailsLabel,
  bottomOffset,
  orderStatus,
}: OngoingOrderFloatingBannerProps) => {
  const { t } = useTranslation();
  const slideAnim = useSharedValue(1);
  const pulseAnim = useSharedValue(0);
  const progressAnim = useSharedValue(0);
  const currentProgress = getOrderProgress(orderStatus);

  useEffect(() => {
    // Slide in from right
    slideAnim.value = withTiming(0, { duration: 400 });

    // Pulsing animation
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: PULSE_DURATION }),
        withTiming(0, { duration: PULSE_DURATION })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(pulseAnim);
      cancelAnimation(slideAnim);
      cancelAnimation(progressAnim);
    };
  }, [pulseAnim, slideAnim, progressAnim]);

  // Animate progress when status changes
  useEffect(() => {
    progressAnim.value = withTiming(currentProgress, {
      duration: PROGRESS_BAR_ANIMATION_DURATION,
    });
  }, [currentProgress, progressAnim]);

  const slideStyle = useAnimatedStyle(() => {
    const translateX = interpolate(slideAnim.value, [0, 1], [0, 400], Extrapolate.CLAMP);
    return {
      transform: [{ translateX }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pulseAnim.value, [0, 1], [MIN_PULSE_OPACITY, MAX_PULSE_OPACITY]);
    return { opacity };
  });

  const expandedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(isExpanded ? EXPANDED_BODY_HEIGHT : 0, {
        duration: EXPAND_ANIMATION_DURATION,
      }),
      opacity: withTiming(isExpanded ? 1 : 0, { duration: EXPAND_ANIMATION_DURATION }),
    };
  });

  // Progress bar animations for each step
  const progressStep1Style = useAnimatedStyle(() => {
    const opacity = progressAnim.value >= 1 ? 1 : 0.3;
    return { opacity };
  });

  const progressStep2Style = useAnimatedStyle(() => {
    const opacity = progressAnim.value >= 2 ? 1 : 0.3;
    return { opacity };
  });

  const progressStep3Style = useAnimatedStyle(() => {
    const opacity = progressAnim.value >= 3 ? 1 : 0.3;
    return { opacity };
  });

  return (
    <Animated.View style={[styles.floatingBanner, { bottom: bottomOffset }, slideStyle]}>
      <View style={styles.floatingContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPressDetails}
          style={styles.floatingContent}>
          <Animated.View style={[styles.floatingIconContainer, pulseStyle]}>
            <Package size={s(20)} color="#FFFFFF" strokeWidth={2.5} />
          </Animated.View>
          <View style={styles.floatingTextContainer}>
            <Text allowFontScaling={false} style={styles.floatingTitle} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.floatingBadge}>
              <Clock size={s(10)} color="#FFF8F0" />
              <Text allowFontScaling={false} style={styles.floatingBadgeText} numberOfLines={1}>
                {statusLabel}
              </Text>
            </View>
          </View>
          <View style={styles.floatingAction}>
            <ChevronRight size={s(20)} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Animated.View style={[styles.progressStep, progressStep1Style]}>
              <View style={styles.progressDot} />
              <Text allowFontScaling={false} style={styles.progressLabel}>
                {t('layout.ongoingOrder.progressSteps.created')}
              </Text>
            </Animated.View>
            <Animated.View style={[styles.progressLine, progressStep2Style]} />
            <Animated.View style={[styles.progressStep, progressStep2Style]}>
              <View style={styles.progressDot} />
              <Text allowFontScaling={false} style={styles.progressLabel}>
                {t('layout.ongoingOrder.progressSteps.preparing')}
              </Text>
            </Animated.View>
            <Animated.View style={[styles.progressLine, progressStep3Style]} />
            <Animated.View style={[styles.progressStep, progressStep3Style]}>
              <View style={styles.progressDot} />
              <Text allowFontScaling={false} style={styles.progressLabel}>
                {t('layout.ongoingOrder.progressSteps.inDelivery')}
              </Text>
            </Animated.View>
          </View>
        </View>
      </View>
    </Animated.View>
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
    marginTop: '-8@vs',
    marginBottom: '88@vs',
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
  floatingBanner: {
    position: 'absolute',
    right: '16@s',
    width: '88%',
    maxWidth: '340@s',
    borderRadius: '20@ms',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 4,
  },
  floatingContainer: {
    width: '100%',
    backgroundColor: '#CA251B',
    borderRadius: '20@ms',
    paddingVertical: '12@vs',
    paddingHorizontal: '16@s',
    paddingBottom: '16@vs',
  },
  floatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingIconContainer: {
    width: '36@s',
    height: '36@s',
    borderRadius: '18@s',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10@s',
  },
  floatingTextContainer: {
    flex: 1,
  },
  floatingTitle: {
    color: '#FFFFFF',
    fontSize: '14@ms',
    fontWeight: '700',
    marginBottom: '3@vs',
  },
  floatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: '6@s',
    paddingVertical: '2@vs',
    borderRadius: '10@ms',
    alignSelf: 'flex-start',
  },
  floatingBadgeText: {
    color: '#FFF8F0',
    fontSize: '10@ms',
    fontWeight: '600',
    marginLeft: '3@s',
  },
  floatingAction: {
    width: '28@s',
    height: '28@s',
    borderRadius: '14@s',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '8@s',
  },
  progressContainer: {
    marginTop: '12@vs',
    paddingTop: '12@vs',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: '10@s',
    height: '10@s',
    borderRadius: '5@s',
    backgroundColor: '#FFFFFF',
    marginBottom: '4@vs',
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: '9@ms',
    fontWeight: '600',
    textAlign: 'center',
  },
  progressLine: {
    height: '2@vs',
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: '4@s',
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

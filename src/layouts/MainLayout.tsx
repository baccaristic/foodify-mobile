import { Home, Search, ShoppingBag, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ReactNode, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  Extrapolation,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { ScaledSheet, s, vs, ms } from 'react-native-size-matters';
import { Image } from 'expo-image';

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
  headerMaxHeight?: number;
  headerMinHeight?: number;
  headerBackgroundImage?: any;
  headerCollapsed?: boolean;
  enableHeaderCollapse?: boolean;
  navItems?: NavItem[];
  activeTab?: string;
  onTabPress?: (route: string) => void;
}

export default function MainLayout({
  showHeader = true,
  showFooter = true,
  customHeader,
  collapsedHeader,
  mainContent,
  headerMaxHeight,
  headerMinHeight,
  headerBackgroundImage,
  headerCollapsed = false,
  enableHeaderCollapse = true,
  navItems,
  activeTab,
  onTabPress,
}: MainLayoutProps) {
  const screenHeight = Dimensions.get('screen').height;
  const insets = useSafeAreaInsets();
  const defaultMax = screenHeight * 0.28;
  const minResponsiveMax = screenHeight * 0.2;
  const MAX_HEIGHT = Math.max(headerMaxHeight ?? defaultMax, minResponsiveMax);
  const MIN_HEIGHT = headerMinHeight ?? screenHeight * 0.12;
  const SCROLL_DISTANCE = MAX_HEIGHT - MIN_HEIGHT + insets.top;
  const collapseEnabled = enableHeaderCollapse && showHeader;

  const navigation = useOptionalNavigation();
  const route = useOptionalRoute();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    if (!collapseEnabled) {
      return;
    }
    scrollY.value = event.contentOffset.y;
  });

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
            <Animated.View
              style={fullHeaderStyle}
              pointerEvents={
                collapseEnabled
                  ? scrollY.value < SCROLL_DISTANCE / 2
                    ? 'auto'
                    : 'none'
                  : 'auto'
              }
            >
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
          pointerEvents={scrollY.value >= SCROLL_DISTANCE / 2 ? 'auto' : 'none'}
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

  return (
    <SafeAreaView style={styles.container}>
      {headerNode}

      <Animated.ScrollView
        style={[styles.scrollView, !collapseEnabled && styles.staticScrollView]}
        contentContainerStyle={{
          paddingTop: collapseEnabled ? vs(10) : vs(20),
          paddingBottom: showFooter ? vs(80) : vs(20),
        }}
        scrollEventThrottle={16}
        onScroll={collapseEnabled ? scrollHandler : undefined}>
        <View style={styles.mainContent}>{mainContent}</View>
      </Animated.ScrollView>

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





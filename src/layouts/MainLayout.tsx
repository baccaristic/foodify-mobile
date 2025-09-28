import { Home, Search, ShoppingBag, User } from 'lucide-react-native';
import { ReactNode } from 'react';
import { View, TouchableOpacity, Text, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, s, vs, ms } from 'react-native-size-matters';
import { Image } from 'expo-image';

const navItems = [
  { icon: Home, label: 'Home', active: true },
  { icon: Search, label: 'Search', active: false },
  { icon: ShoppingBag, label: 'Orders', active: false },
  { icon: User, label: 'Account', active: false },
];

interface MainLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;
  customHeader?: ReactNode;
  collapsedHeader?: ReactNode;
  mainContent: ReactNode;
  headerMaxHeight?: number;
  headerMinHeight?: number;
  headerBackgroundImage?: any;
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
}: MainLayoutProps) {
    const screenHeight = Dimensions.get('screen').height;
  const MAX_HEIGHT = headerMaxHeight ?? screenHeight * 0.2; // 20% of screen height
  const MIN_HEIGHT = headerMinHeight ?? screenHeight * 0.12; // 12% of screen height
  const SCROLL_DISTANCE = MAX_HEIGHT - MIN_HEIGHT;

  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const fullHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolate.CLAMP);
    return { opacity };
  });

  const collapsedHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_DISTANCE / 2, SCROLL_DISTANCE],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const headerHeightStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [MAX_HEIGHT, MIN_HEIGHT],
      Extrapolate.CLAMP
    );
    return { height };
  });

  return (
    <SafeAreaView style={styles.container}>
      {showHeader && (
        <Animated.View style={[headerHeightStyle, { width: '100%', overflow: 'hidden' }]}>
          {showHeader && (
            <>
              {headerBackgroundImage ? (
                <ImageBackground
                  source={headerBackgroundImage}
                  style={{ flex: 1, width: '100%', height: '100%' }}
                  resizeMode="cover">
                  <View style={styles.overlay} />
                  {customHeader && (
                    <Animated.View style={fullHeaderStyle}>{customHeader}</Animated.View>
                  )}
                  {collapsedHeader && (
                    <Animated.View style={[styles.collapsedHeader, collapsedHeaderStyle]}>
                      {collapsedHeader}
                    </Animated.View>
                  )}
                </ImageBackground>
              ) : (
                <>
                  {customHeader && (
                    <Animated.View style={fullHeaderStyle}>{customHeader}</Animated.View>
                  )}
                  {collapsedHeader && (
                    <Animated.View style={[styles.collapsedHeader, collapsedHeaderStyle]}>
                      {collapsedHeader}
                    </Animated.View>
                  )}
                </>
              )}
            </>
          )}
        </Animated.View>
      )}

      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: vs(20),
          paddingBottom: showFooter ? vs(80) : vs(20),
        }}
        scrollEventThrottle={16}
        onScroll={scrollHandler}>
        <View style={styles.mainContent}>{mainContent}</View>
      </Animated.ScrollView>

      {showFooter && (
        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          <View style={styles.navRow}>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const color = item.active ? '#CA251B' : '#D9D9D9';
              return (
                <TouchableOpacity key={index} activeOpacity={0.7} style={styles.navButton}>
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
  mainContent: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: '24@ms',
    borderTopRightRadius: '24@ms',
    marginTop: '-12@vs',
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

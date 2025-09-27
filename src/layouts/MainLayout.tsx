// @ts-ignore
import { Home, Search, ShoppingBag, User } from "lucide-react-native";
import { ReactNode } from "react";
import { View, Dimensions, TouchableOpacity, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { SafeAreaView } from 'react-native-safe-area-context';

const HEADER_MAX_HEIGHT = 160;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const { width } = Dimensions.get("window");
const navItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Search, label: "Search", active: false },
  { icon: ShoppingBag, label: "Orders", active: false },
  { icon: User, label: "Account", active: false },
];

interface MainLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;
  customHeader?: ReactNode;
  collapsedHeader?: ReactNode;
  mainContent: ReactNode;
}

export default function MainLayout({
  showHeader = true,
  showFooter = true,
  customHeader,
  collapsedHeader,
  mainContent,
}: MainLayoutProps) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Full header: visible when scroll < HEADER_SCROLL_DISTANCE
  const fullHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE / 2],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  // Collapsed header: visible when scroll >= HEADER_SCROLL_DISTANCE
  const collapsedHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const headerHeightStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    );
    return { height };
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {showHeader && (
        <Animated.View style={[headerHeightStyle, { width: "100%" }]}>
          {/* Full Header */}
          {customHeader && (
            <Animated.View style={fullHeaderStyle}>{customHeader}</Animated.View>
          )}

          {/* Collapsed Header */}
          {collapsedHeader && (
            <Animated.View
              style={[
                { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
                collapsedHeaderStyle,
              ]}
            >
              {collapsedHeader}
            </Animated.View>
          )}
        </Animated.View>
      )}

      {/* MAIN CONTENT */}
      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: showFooter ? 80 : 20,
        }}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
      >
        <View className="flex-1 bg-white rounded-t-3xl -mt-6">
          {mainContent}
        </View>
      </Animated.ScrollView>

      {/* FOOTER */}
      {showFooter && (
       <View className="absolute bottom-0 left-0 right-0 bg-[#17213A] px-6 py-4 rounded-t-3xl w-full shadow-2xl">
          <View className="flex-row justify-around items-center">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const color = item.active ? "#CA251B" : "#D9D9D9"; 

              return (
                <TouchableOpacity
                  key={index}
                  className="flex-col items-center justify-center gap-1 min-w-0 p-1"
                  activeOpacity={0.7}
                >
                  <Icon
                    size={24}
                    color={color}
                  />
                  <Text
                    className={`text-xs font-medium ${item.active ? "text-[#CA251B]" : "text-[#D9D9D9]"}`}
                  >
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

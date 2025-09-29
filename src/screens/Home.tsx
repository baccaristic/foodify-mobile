import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Percent, Star, Gift, Pizza, Hamburger, ArrowLeft, ChevronDown, Search } from "lucide-react-native";
import MainLayout from "~/layouts/MainLayout";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { ScaledSheet, s, vs } from "react-native-size-matters";

export default function HomePage() {
  const navigation = useNavigation();

  const mainContent = (
    <View style={styles.mainWrapper}>
      <Text allowFontScaling={false} style={styles.sectionTitle}>Nearby Restaurants</Text>
      <View style={styles.cardList}>
        {[...Array(5)].map((_, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => navigation.navigate("RestaurantDetails" as never)}
          >
            <Image
              source={require("../../assets/baguette.png")}
              style={styles.cardImage}
              contentFit="cover"
            />
            <View style={styles.cardBody}>
              <Text allowFontScaling={false} style={styles.cardTitle}>BAGUETTES & BAGUETTE</Text>
              <View style={styles.ratingRow}>
                <Star size={s(14)} color="gold" fill="gold" />
                <Text allowFontScaling={false} style={styles.ratingText}>4.5/5</Text>
              </View>
              <Text allowFontScaling={false} style={styles.deliveryTime}>15-25 min</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const customHeader = (
    <Animated.View entering={FadeIn.duration(500)}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity>
            <ArrowLeft size={s(22)} color="white" />
          </TouchableOpacity>
          <Text allowFontScaling={false} style={styles.headerTitle}>San Francisco Bay Area</Text>
          <View style={{ width: s(22) }} />
        </View>
        <View style={styles.searchBar}>
          <Text allowFontScaling={false} style={styles.searchPlaceholder}>Ready to eat?</Text>
          <Search size={s(18)} color="gray" />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: vs(20) }}
          contentContainerStyle={{ paddingHorizontal: s(12), alignItems: "center" }}
        >
          {[
            { icon: Percent, label: "Discount" },
            { icon: Star, label: "Top Restaurants" },
            { icon: Gift, label: "Rewards" },
            { icon: Pizza, label: "Pizza" },
            { icon: Hamburger, label: "Burger" },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.categoryButton}>
              <View style={styles.categoryIconWrapper}>
                <item.icon size={s(22)} color="red" />
              </View>
              <Text allowFontScaling={false} style={styles.categoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Animated.View>
  );

  const collapsedHeader = (
    <View style={styles.collapsedHeader}>
      <View style={styles.collapsedSearch}>
        <Search size={s(18)} color="gray" style={{ marginRight: s(6) }} />
        <Text style={styles.collapsedPlaceholder}>Search in Food</Text>
      </View>
      <TouchableOpacity style={styles.filterButton}>
        <Text style={styles.filterText}>Food Type</Text>
        <ChevronDown size={s(14)} color="gray" />
      </TouchableOpacity>
    </View>
  );

  return (
    <MainLayout
      headerBackgroundImage={require("../../assets/pattern1.png")}
      showHeader
      showFooter
      headerMaxHeight={vs(160)}
      headerMinHeight={vs(100)}
      customHeader={customHeader}
      collapsedHeader={collapsedHeader}
      mainContent={mainContent}
    />
  );
}

const styles = ScaledSheet.create({
  mainWrapper: { paddingHorizontal: "16@s" },
  sectionTitle: { fontSize: "18@ms", fontWeight: "700", marginTop: "16@vs", marginBottom: "12@vs" },
  cardList: { gap: "12@vs" },
  card: {
    backgroundColor: "white",
    borderRadius: "12@ms",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: "6@ms",
    elevation: 3,
  },
  cardImage: { width: "100%", height: "140@vs" },
  cardBody: { padding: "10@s" },
  cardTitle: { fontSize: "16@ms", fontWeight: "700" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: "4@vs" },
  ratingText: { fontSize: "12@ms", marginLeft: "4@s" },
  deliveryTime: { color: "red", fontSize: "12@ms", marginTop: "4@vs" },

  headerWrapper: { padding: "12@s", paddingBottom: "20@vs" },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "white", fontSize: "16@ms", fontWeight: "700" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "50@ms",
    paddingHorizontal: "12@s",
    paddingVertical: "8@vs",
    marginTop: "12@vs",
  },
  searchPlaceholder: { color: "gray", flex: 1, fontSize: "13@ms" },

  categoryButton: { alignItems: "center", marginHorizontal: "8@s" },
  categoryIconWrapper: { backgroundColor: "white", borderRadius: "50@ms", padding: "8@s" },
  categoryLabel: { color: "white", fontSize: "11@ms", marginTop: "4@vs", textAlign: "center" },

  collapsedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "12@s",
    backgroundColor: "white",
    flex: 1,
  },
  collapsedSearch: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5E5",
    borderRadius: "50@ms",
    paddingHorizontal: "12@s",
    paddingVertical: "6@vs",
  },
  collapsedPlaceholder: { color: "gray", fontSize: "13@ms" },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5E5",
    borderRadius: "50@ms",
    paddingHorizontal: "10@s",
    paddingVertical: "6@vs",
    marginLeft: "8@s",
  },
  filterText: { color: "#333", fontSize: "12@ms", marginRight: "4@s" },
});

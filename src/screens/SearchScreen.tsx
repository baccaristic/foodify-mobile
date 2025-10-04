import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from "react-native";
import { ScaledSheet, s, vs } from "react-native-size-matters";
import { Search, SlidersHorizontal, Star } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import MainLayout from "~/layouts/MainLayout";
import Header from "~/components/Header";
import { NavigationProp, ParamListBase, useNavigation } from "@react-navigation/native";
import FiltersOverlay from "~/components/FiltersOverlay";

const image1 = require("../../assets/TEST.png");
const image2 = require("../../assets/baguette.png");
const image3 = require("../../assets/TEST.png");

interface RestaurantData {
  id: number;
  name: string;
  time: string;
  rating: number;
  isTopChoice?: boolean;
  isFreeDelivery?: boolean;
  discount?: string;
  image: any;
}

const mockSearchResults: RestaurantData[] = [
  { id: 1, name: "Da Pietro", time: "15-25 min", rating: 4.5, isTopChoice: true, image: image1 },
  { id: 2, name: "Papa Jones", time: "15-25 min", rating: 4.5, isFreeDelivery: true, image: image2 },
  { id: 3, name: "Papa Jones", time: "15-25 min", rating: 4.5, discount: "20%", image: image3 },
];

const PillButton = ({
  label,
  icon: Icon,
  onPress,
  isActive = false,
}: {
  label?: string;
  icon?: any;
  onPress: () => void;
  isActive?: boolean;
}) => {
  const buttonStyle = [styles.pillButton, isActive && styles.pillActive];
  const textStyle = isActive ? styles.pillTextActive : styles.pillText;
  const iconColor = textStyle.color;

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle} activeOpacity={0.85}>
      {Icon && (
        <Icon
          size={s(20)}
          color={iconColor}
          style={{ marginRight: label ? s(4) : 0 }}
        />
      )}
      {label && <Text style={textStyle}>{label}</Text>}
    </TouchableOpacity>
  );
};

const RestaurantCard = ({ data }: { data: RestaurantData }) => {
  const { name, time, rating, isTopChoice, isFreeDelivery, discount, image } = data;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <Image source={image} style={styles.cardImage} />

      {isTopChoice && (
        <View style={styles.badgeTopRight}>
          <Star size={s(16)} color="white" fill="#CA251B" />
        </View>
      )}

      {discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}</Text>
        </View>
      )}

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{name}</Text>
        <View style={styles.timeRatingRow}>
          <Text style={styles.deliveryTime}>{time}</Text>
          <View style={styles.ratingRow}>
            <Star size={s(14)} color="#FACC15" fill="#FACC15" />
            <Text style={styles.ratingText}>{rating}/5</Text>
          </View>
        </View>

        {isFreeDelivery && (
          <View style={styles.promoContainer}>
            <View style={styles.freeDeliveryPill}>
              <Text style={styles.promoText}>Free Delivery</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const [filters, setFilters] = useState({
    filter: false,
    promotions: false,
    topChoice: false,
    freeDelivery: false,
  });

  const toggleFilter = (key: keyof typeof filters) =>
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const filteredResults = useMemo(() => {
    const term = (searchTerm ?? "").trim().toLowerCase();
    const anyFilterActive = filters.topChoice || filters.freeDelivery || filters.promotions;

    return mockSearchResults.filter((item) => {
      const name = (item.name ?? "").toLowerCase();
      const matchText = term.length === 0 || name.includes(term);
      const matchFilter =
        !anyFilterActive ||
        (filters.topChoice && !!item.isTopChoice) ||
        (filters.freeDelivery && !!item.isFreeDelivery) ||
        (filters.promotions && !!item.discount);

      return matchText && matchFilter;
    });
  }, [searchTerm, filters]);

  const customHeader = (
    <Animated.View entering={FadeIn.duration(500)} style={styles.headerWrapper}>
      <Header
        title="San Francisco Bay Area"
        onBack={() => navigation.goBack()}
        onLocationPress={() => console.log("Location pressed")}
        compact
      />

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#666"
          />
          <Search size={s(18)} color="black" />
        </View>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: vs(20) }}
        contentContainerStyle={styles.pillsContainer}
      >
        <PillButton
  icon={SlidersHorizontal}
  onPress={() => setShowFilters(true)}
  isActive={showFilters}
/>


        <PillButton
          label="Promotions"
          onPress={() => toggleFilter("promotions")}
          isActive={filters.promotions}
        />
        <PillButton
          label="Top Choice"
          onPress={() => toggleFilter("topChoice")}
          isActive={filters.topChoice}
        />
        <PillButton
          label="Free Delivery"
          onPress={() => toggleFilter("freeDelivery")}
          isActive={filters.freeDelivery}
        />
      </ScrollView>
    </Animated.View>
  );

  const mainContent = (
    <View style={styles.mainWrapper}>
      <View style={{ height: vs(10) }} />
      {searchTerm.trim().length > 0 && (
        <Text style={styles.resultsCount}>
          {filteredResults.length} Results for “{searchTerm}”
        </Text>
      )}
      <View style={styles.cardList}>
        {filteredResults.map((item) => (
          <RestaurantCard key={item.id} data={item} />
        ))}
      </View>
    </View>
  );

  return (
    <>
    <MainLayout
      headerBackgroundImage={require("../../assets/pattern1.png")}
      showHeader
      showFooter
      activeTab="Search"
      headerMaxHeight={vs(160)}
      headerMinHeight={vs(120)}
      customHeader={customHeader}
      enableHeaderCollapse={false}
      mainContent={mainContent}
    />
    <FiltersOverlay
  visible={showFilters}
  onClose={() => setShowFilters(false)}
  onClearAll={() => {
    setFilters({
      filter: false,
      promotions: false,
      topChoice: false,
      freeDelivery: false,
    });
  }}
/>
</>
  );
}

const styles = ScaledSheet.create({
  headerWrapper: {
    padding: "6@s",
    paddingBottom: "20@vs",
  },
  searchBarContainer: {
    marginTop: "10@vs",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "12@ms",
    paddingHorizontal: "12@s",
    paddingVertical: "2@vs",
    marginHorizontal: "4@s",
  },
  searchInput: {
    flex: 1,
    fontSize: "15@ms",
    fontFamily: "Roboto",
    fontWeight: "500",
    color: "black",
  },
  pillsContainer: {
    paddingHorizontal: "6@s",
    gap: "8@s",
    paddingBottom: "10@vs",
  },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white", 
    borderRadius: "20@ms",
    paddingHorizontal: "14@s",
    paddingVertical: "8@vs",
    borderWidth: 1,
    borderColor: "#CA251B",
  },
  pillActive: {
    backgroundColor: "#CA251B", 
    borderColor: "white",
  },
  pillText: {
    color: "#CA251B",
    fontFamily: "Roboto",
    fontSize: "14@ms",
    fontWeight: "500",
  },
  pillTextActive: {
    color: "white",
    fontFamily: "Roboto",
    fontSize: "14@ms",
    fontWeight: "500",
  },
  mainWrapper: {
    flex: 1,
    backgroundColor: "transparent",
    borderTopLeftRadius: "24@ms",
    borderTopRightRadius: "24@ms",
    overflow: "hidden",
    paddingHorizontal: "16@s",
    paddingBottom: "100@vs",
  },
  resultsCount: {
    fontFamily: "Roboto",
    fontSize: "14@ms",
    fontWeight: "600",
    marginBottom: "12@vs",
    color: "#8B909D",
    textAlign: "center",
  },
  cardList: { gap: "16@vs" },
  card: {
    backgroundColor: "white",
    borderRadius: "12@ms",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: "6@ms",
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: "180@vs",
    resizeMode: "cover",
  },
  badgeTopRight: {
    position: "absolute",
    top: "10@vs",
    right: "10@s",
    backgroundColor: "white",
    borderRadius: "50@ms",
    padding: "4@s",
    elevation: 3,
  },
  discountBadge: {
    position: "absolute",
    top: "10@vs",
    right: "10@s",
    backgroundColor: "#CA251B",
    borderRadius: "8@ms",
    paddingHorizontal: "8@s",
    paddingVertical: "4@vs",
    elevation: 3,
  },
  discountText: {
    color: "white",
    fontFamily: "Roboto",
    fontSize: "14@ms",
    fontWeight: "700",
  },
  cardBody: { padding: "10@s" },
  cardTitle: {
    fontFamily: "Roboto",
    fontSize: "18@ms",
    fontWeight: "700",
    color: "#333",
    marginBottom: "4@vs",
  },
  timeRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryTime: {
    color: "#6B7280",
    fontFamily: "Roboto",
    fontSize: "14@ms",
  },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: {
    fontFamily: "Roboto",
    fontSize: "14@ms",
    marginLeft: "4@s",
    color: "#333",
    fontWeight: "600",
  },
  promoContainer: {
    flexDirection: "row",
    marginTop: "8@vs",
  },
  freeDeliveryPill: {
    backgroundColor: "#CA251B",
    borderRadius: "6@ms",
    paddingHorizontal: "10@s",
    paddingVertical: "4@vs",
  },
  promoText: {
    color: "white",
    fontFamily: "Roboto",
    fontSize: "13@ms",
    fontWeight: "600",
  },
});

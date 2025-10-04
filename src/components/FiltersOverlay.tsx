import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Image,
} from "react-native";
import { ScaledSheet, s, vs } from "react-native-size-matters";
import { X, Award, Heart, Flame, Star } from "lucide-react-native";

interface FiltersOverlayProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: { sort: string; topEat: boolean; maxFee: number }) => void;
}

export default function FiltersOverlay({ visible, onClose, onApply }: FiltersOverlayProps) {
  const feeSteps = [1, 1.5, 2, 2.5];
  const [maxFee, setMaxFee] = useState(1.5);
  const [sortOption, setSortOption] = useState("picked");
  const [topEat, setTopEat] = useState(true);

  const clearAll = () => {
    setSortOption("picked");
    setTopEat(true);
    setMaxFee(1.5);
  };

  const applyFilters = () => {
    onApply?.({ sort: sortOption, topEat, maxFee });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose}>
              <X color="#17213A" size={s(22)} />
            </TouchableOpacity>
            <Text style={styles.title}>FILTERS</Text>
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Sort</Text>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSortOption("picked")}
            >
              <Heart
                color={sortOption === "picked" ? "#CA251B" : "#17213A"}
                size={s(20)}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: sortOption === "picked" ? "#CA251B" : "#17213A" },
                ]}
              >
                Picked for you
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSortOption("popular")}
            >
              <Flame
                color={sortOption === "popular" ? "#CA251B" : "#17213A"}
                size={s(20)}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: sortOption === "popular" ? "#CA251B" : "#17213A" },
                ]}
              >
                Most popular
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSortOption("rating")}
            >
              <Star
                color={sortOption === "rating" ? "#CA251B" : "#17213A"}
                size={s(20)}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: sortOption === "rating" ? "#CA251B" : "#17213A" },
                ]}
              >
                Rating
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.rowBetween}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: s(6) }}>
                <Award color="#CA251B" size={s(22)} />
                <Text style={styles.sectionTitle}>Top Eat</Text>
              </View>
              <Switch
                trackColor={{ false: "#ccc", true: "#CA251B" }}
                thumbColor="white"
                value={topEat}
                onValueChange={setTopEat}
              />
            </View>

            <View style={styles.divider} />

            <Text style={[styles.sectionTitle, { marginBottom: vs(48) }]}>
              Max Delivery Fee
            </Text>

            <View style={styles.sliderWrapper}>
              <View style={styles.sliderTrack}>
                <View style={styles.sliderLine} />
                <View
                  style={[
                    styles.filledTrack,
                    { width: `${((maxFee - 1) / 1.5) * 100}%` },
                  ]}
                />

                {feeSteps.map((fee) => (
                  <TouchableOpacity
                    key={fee}
                    activeOpacity={0.8}
                    onPress={() => setMaxFee(fee)}
                    style={[
                      styles.dotTouchable,
                      { left: `${((fee - 1) / 1.5) * 100}%` },
                    ]}
                  >
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            maxFee === fee ? "#CA251B" : "#CA251B55",
                        },
                      ]}
                    />
                  </TouchableOpacity>
                ))}

                <Image
                  source={require("../../assets/pin.png")}
                  style={[
                    styles.thumbImage,
                    { left: `${((maxFee - 1) / 1.5) * 100}%` },
                  ]}
                />
              </View>

              <View style={styles.feeLabels}>
                {feeSteps.map((fee) => (
                  <Text key={fee} style={styles.feeLabel}>
                    {fee}DT
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>

            <View style={{ height: vs(40) }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = ScaledSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: "24@ms",
    borderTopRightRadius: "24@ms",
    padding: "16@s",
    height: "85%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12@vs",
  },
  title: {
    fontFamily: "Roboto",
    fontSize: "18@ms",
    fontWeight: "700",
    color: "#17213A",
  },
  clearText: {
    color: "#CA251B",
    fontSize: "14@ms",
    fontWeight: "500",
  },
  sectionTitle: {
    fontFamily: "Roboto",
    fontSize: "16@ms",
    fontWeight: "700",
    color: "#17213A",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: "10@s",
    marginVertical: "6@vs",
  },
  optionText: {
    fontFamily: "Roboto",
    fontSize: "15@ms",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: "10@vs",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTrack: {
    width: "90%",
    height: vs(40),
    alignSelf: "center",
    justifyContent: "center",
    position: "relative",
  },
  sliderLine: {
    position: "absolute",
    height: 2,
    width: "100%",
    backgroundColor: "#D1D5DB",
    top: "50%",
  },
  filledTrack: {
    position: "absolute",
    height: 2,
    backgroundColor: "#CA251B",
    top: "50%",
  },
  dotTouchable: {
    position: "absolute",
    top: "14%",
    width: "32@s",
    height: "32@s",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -16 }],
  },
  dot: {
    width: "10@s",
    height: "10@s",
    borderRadius: "5@s",
  },
  thumbImage: {
    position: "absolute",
    top: "-30@vs",
    width: "28@s",
    height: "28@s",
    resizeMode: "contain",
    transform: [{ translateX: -14 }],
  },
  feeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: "8@vs",
  },
  feeLabel: {
    fontFamily: "Roboto",
    fontSize: "13@ms",
    fontWeight: "600",
    color: "#CA251B",
  },
  applyButton: {
    marginTop: "20@vs",
    backgroundColor: "#CA251B",
    paddingVertical: "12@vs",
    borderRadius: "12@ms",
    alignItems: "center",
    fontStyle:"Roboto"
  },
  applyText: {
    color: "white",
    fontFamily: "Roboto",
    fontSize: "16@ms",
    fontWeight: "600",
  },
});

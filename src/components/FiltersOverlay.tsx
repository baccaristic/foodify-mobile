import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
} from "react-native";
import { ScaledSheet, s, vs } from "react-native-size-matters";
import { X, Award, Heart, Flame, Star, Bike } from "lucide-react-native";

interface FiltersOverlayProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: { sort: string; topEat: boolean; maxFee: number }) => void;
  onClearAll?: () => void;
  initialFilters?: {
    sort: string;
    topEat: boolean;
    maxFee: number;
  };
}

export default function FiltersOverlay({
  visible,
  onClose,
  onApply,
  onClearAll,
  initialFilters,
}: FiltersOverlayProps) {
  const feeSteps = [1, 1.5, 2, 2.5];
  const [maxFee, setMaxFee] = useState(initialFilters?.maxFee ?? 2.5);
  const [sortOption, setSortOption] = useState(initialFilters?.sort ?? "picked");
  const [topEat, setTopEat] = useState(initialFilters?.topEat ?? false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setSortOption(initialFilters?.sort ?? "picked");
    setTopEat(initialFilters?.topEat ?? false);
    setMaxFee(initialFilters?.maxFee ?? 2.5);
  }, [visible, initialFilters]);

  const clearAll = () => {
    setSortOption("picked");
    setTopEat(false);
    setMaxFee(2.5);
    onClearAll?.();
  };

  const applyFilters = () => {
    onApply?.({ sort: sortOption, topEat, maxFee });
    onClose();
  };

  const getNextFeeStep = () => {
    const currentIndex = feeSteps.indexOf(maxFee);
    if (currentIndex <= 0) {
      return feeSteps[feeSteps.length - 1];
    }
    return feeSteps[currentIndex - 1];
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
              onPress={() => {
                setSortOption("fee_asc");
                setMaxFee(getNextFeeStep())
              }}
            >
              <Bike
                color={sortOption === "fee_asc" ? "#CA251B" : "#17213A"}
                size={s(20)}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: sortOption === "fee_asc" ? "#CA251B" : "#17213A" },
                ]}
              >
                Delivery Fee
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
  applyButton: {
    marginTop: "20@vs",
    backgroundColor: "#CA251B",
    paddingVertical: "12@vs",
    borderRadius: "12@ms",
    alignItems: "center",
    fontStyle: "Roboto"
  },
  applyText: {
    color: "white",
    fontFamily: "Roboto",
    fontSize: "16@ms",
    fontWeight: "600",
  },
});

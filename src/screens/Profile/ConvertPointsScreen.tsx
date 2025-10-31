import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { ScaledSheet, moderateScale, ms, s, verticalScale, vs } from "react-native-size-matters";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import MainLayout from "~/layouts/MainLayout";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getLoyaltyBalance, redeemCouponWithPoints } from "~/api/loyalty";
import HeaderWithBackButton from "~/components/HeaderWithBackButton";
import type { RedeemCouponRequest } from "~/interfaces/Loyalty";
import { CircleAlert, CircleCheckBig, Percent, Sparkles, Ticket, Truck, X } from "lucide-react-native";

const accentColor = "#CA251B";
const headerColor = "#17213A";

export default function ConvertPointsScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const FREE_DELIVERY_COST = 250;
  const DISCOUNT_COST_PER_PERCENT = 15;

  const { data: balance, refetch, isFetching } = useQuery({
    queryKey: ["loyalty", "balance"],
    queryFn: getLoyaltyBalance,
  });

  const totalPoints = Number(balance?.balance ?? 0);

  const [selectedCoupon, setSelectedCoupon] = useState<
    "FREE_DELIVERY" | "DISCOUNT" | null
  >(null);
  const [discountPercent, setDiscountPercent] = useState(20);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCouponCode, setCreatedCouponCode] = useState<string | null>(
    null
  );

  const discountCost = useMemo(
    () => discountPercent * DISCOUNT_COST_PER_PERCENT,
    [discountPercent]
  );

  const cost =
    selectedCoupon === "FREE_DELIVERY"
      ? FREE_DELIVERY_COST
      : selectedCoupon === "DISCOUNT"
        ? discountCost
        : 0;

  const remaining = (totalPoints - cost).toFixed(3);
  const canCreate = selectedCoupon && parseFloat(remaining) >= 0;

  const { mutateAsync: redeem, isPending } = useMutation({
    mutationFn: (payload: RedeemCouponRequest) =>
      redeemCouponWithPoints(payload),
    onSuccess: async (coupon) => {
      await queryClient.invalidateQueries({ queryKey: ["loyalty", "balance"] });
      await queryClient.invalidateQueries({
        queryKey: ["loyalty", "transactions"],
      });
      setCreatedCouponCode(coupon.code);
      setShowSuccessModal(true);
    },
    onError: (err) => {
      console.error("❌ Failed to redeem coupon:", err);
    },
  });

  const handleRedeem = async () => {
    if (!selectedCoupon) return;

    const payload: RedeemCouponRequest =
      selectedCoupon === "FREE_DELIVERY"
        ? { type: "FREE_DELIVERY" }
        : { type: "PERCENTAGE_DISCOUNT", discountPercent };

    await redeem(payload);
  };

  useEffect(() => {
    let timerId: number | null = null;
    if (showSuccessModal) {
      timerId = setTimeout(() => {
        setShowSuccessModal(false);
        navigation.navigate('Home' as never);
      }, 10000);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [showSuccessModal, navigation]);

  const mainContent = (
    <ScrollView
      showsVerticalScrollIndicator={true}
      refreshControl={
        <RefreshControl
          refreshing={isFetching}
          colors={[accentColor]}
          onRefresh={refetch}
        />
      }
      contentContainerStyle={{ paddingHorizontal: ms(20) }}
    >
      <View style={styles.redCard}>
        <Text allowFontScaling={false} style={styles.redCardTitle}>Available Foody Points</Text>
        <Text allowFontScaling={false} style={styles.redCardValue}>{totalPoints.toLocaleString()}</Text>
        <Text allowFontScaling={false} style={styles.redCardSubtitle}>
          Create custom rewards with your Foody points
        </Text>
      </View>

      <View style={styles.infoBox}>
        <CircleAlert color="#8D939F" size={20} />
        <Text allowFontScaling={false} style={styles.infoText}>
          Choose the reward you want to create with your foody points. Customize
          and redeem instantly.
        </Text>
      </View>

      <Text allowFontScaling={false} style={styles.sectionTitle}>Select Coupon Type</Text>
      <TouchableOpacity
        style={[
          styles.optionCard,
          { borderColor: selectedCoupon === "FREE_DELIVERY" ? accentColor : "#D1D5DB" },
        ]}
        activeOpacity={0.8}
        onPress={() => setSelectedCoupon("FREE_DELIVERY")}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>

            <Truck color={accentColor} size={34} style={{ marginTop: verticalScale(5) }} />

            <View style={{ flex: 1 }}>
              <Text allowFontScaling={false} style={styles.optionTitle}>Free Delivery Coupon</Text>
              <Text allowFontScaling={false} style={styles.optionSubtitle}>
                Cancel delivery fees on your next order
              </Text>

              {selectedCoupon === "FREE_DELIVERY" && (
                <View style={styles.summaryLine}>
                  <Text allowFontScaling={false} style={{ fontSize: moderateScale(10), marginTop: verticalScale(10) }}>Point Cost :</Text>
                  <Text allowFontScaling={false} style={styles.optionCost}>250 pt</Text>
                </View>
              )}
            </View>

          </View>
        </View>

        <View
          style={[
            styles.radioOuter,
            selectedCoupon === "FREE_DELIVERY" && { marginTop: verticalScale(-24) }
          ]}
        >
          {selectedCoupon === "FREE_DELIVERY" && <View style={styles.radioDot} />}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.optionCard,
          { borderColor: selectedCoupon === "DISCOUNT" ? accentColor : "#D1D5DB" },
        ]}
        activeOpacity={0.8}
        onPress={() => setSelectedCoupon("DISCOUNT")}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Percent color={accentColor} size={34} />
          <View>
            <Text allowFontScaling={false} style={styles.optionTitle}>Discount Coupon</Text>
            <Text allowFontScaling={false} style={styles.optionSubtitle}>
              Save between 5% and 50% on an order
            </Text>
          </View>
        </View>
        <View style={styles.radioOuter}>
          {selectedCoupon === "DISCOUNT" && <View style={styles.radioDot} />}
        </View>
      </TouchableOpacity>

      {selectedCoupon === "DISCOUNT" && (
        <View style={styles.discountSection}>
          <Text allowFontScaling={false} style={styles.discountLabel}>Discount Percentage</Text>
          <Text allowFontScaling={false} style={styles.discountPercent}>{discountPercent}%</Text>
          <Text allowFontScaling={false} style={styles.discountSub}>Discount</Text>

          <View style={styles.sliderWrapper}>

            <Text allowFontScaling={false} style={styles.sliderEdgeText}>5%</Text>

            <View style={styles.sliderContainer}>

              <View style={styles.customTrackBackground}>
                <View style={[
                  styles.customTrackForeground,
                  {
                    width: `${((discountPercent - 5) / 45) * 100}%`,
                    backgroundColor: accentColor,
                  }
                ]} />
              </View>

              <Slider
                style={styles.transparentSlider}
                minimumValue={5}
                maximumValue={50}
                step={1}
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
                thumbTintColor="transparent"
                value={discountPercent}
                onValueChange={setDiscountPercent}
              />
            </View>

            <Text allowFontScaling={false} style={styles.sliderEdgeText}>50%</Text>

          </View>
          <View style={styles.costBox}>
            <View>
              <Text allowFontScaling={false} style={styles.costPointTitle}>Point Cost:</Text>
              <Text allowFontScaling={false} style={styles.costTitle}>Total</Text>
            </View>
            <View>
              <Text allowFontScaling={false} style={styles.costPointValue}>
                {discountPercent} × {DISCOUNT_COST_PER_PERCENT} pts
              </Text>
              <Text allowFontScaling={false} style={styles.costValue}>{discountCost} pts</Text>

            </View>
          </View>
        </View>
      )}

      {selectedCoupon && (
        <View style={styles.summaryBox}>
          <View style={styles.summaryLine}>
            <Text allowFontScaling={false} style={{ color: "#666D8B" }}>Your Points: </Text>
            <Text allowFontScaling={false} style={{ color: headerColor }}>{totalPoints} pts</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text allowFontScaling={false} style={{ color: "#666D8B" }}>Coupon Cost:</Text>
            <Text allowFontScaling={false} style={{ color: "#CA251B" }}>-{cost} pts</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.boxRenaming} >
            <Text allowFontScaling={false} style={{ fontWeight: '600' }}>Remaining </Text>
            <Text allowFontScaling={false} style={[
              styles.remaining,
              { color: parseFloat(remaining) >= 0 ? "#3BCA1B" : "#CA251B" },
            ]}>{remaining}</Text>
          </View>
        </View>
      )}

      {selectedCoupon && parseFloat(remaining) < 0 && (
        <View style={styles.needMoreBox}>
          <Sparkles size={16} color="#6B7280" />
          <Text allowFontScaling={false} style={styles.needMoreText}>
            Need {Math.abs(parseFloat(remaining))} more points
          </Text>
        </View>
      )}

      {selectedCoupon && (
        <TouchableOpacity
          disabled={!canCreate || isPending}
          style={[
            styles.createBtn,
            (!canCreate || isPending) && { backgroundColor: "#C8C8CC" },
          ]}
          onPress={handleRedeem}
        >
          {isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={styles.CouponBox}>
              <Ticket color="white" />
              <Text allowFontScaling={false} style={styles.createText}>  Create coupon</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <Text allowFontScaling={false} style={styles.keepText}>Keep ordering to earn more points</Text>
    </ScrollView>
  );

  const header = (
    <View style={styles.header}>
      <HeaderWithBackButton title="Convert Points" titleMarginLeft={s(70)} />
    </View>
  );

  return (
    <>
      <Modal transparent visible={showSuccessModal} animationType="fade">

        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setShowSuccessModal(false);
            navigation.navigate('Home' as never);
          }}
        >
          <Pressable style={styles.modalBox} >
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('Home' as never);
              }}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <X size={24} color="#666D8B" />
            </TouchableOpacity>
            <CircleCheckBig size={80} color="#16A34A" />
            <Text allowFontScaling={false} style={styles.modalTitle}>Coupon Created!</Text>
            <Text allowFontScaling={false} style={styles.modalSubtitle}>
              Your Coupon has been added to your wallet
            </Text>
          </Pressable>
        </Pressable>
      </Modal>

      <MainLayout
        showHeader
        showFooter={true}
        customHeader={header}
        mainContent={mainContent}
        enableHeaderCollapse={false}
        headerMaxHeight={vs(70)}
        headerMinHeight={vs(30)}
        enforceResponsiveHeaderSize={false}
        activeTab="Profile"
      />
    </>
  );
}

const styles = ScaledSheet.create({
  header: {
    borderBottomColor: "rgba(211,211,211,0.4)",
    borderBottomWidth: 2,
  },
  redCard: {
    backgroundColor: accentColor,
    borderRadius: "14@ms",
    paddingHorizontal: "16@ms",
    paddingVertical: "16@vs",
  },
  redCardTitle: { color: "white", fontSize: "12@ms", fontWeight: "200" },
  redCardValue: {
    fontSize: "24@ms",
    fontWeight: "800",
    color: "white",
    marginTop: "4@vs",
  },
  redCardSubtitle: {
    color: "white",
    fontSize: "10@ms",
    marginTop: "4@vs",
    opacity: 0.9,
  },
  infoBox: {
    backgroundColor: "#F2F3F5",
    borderRadius: "10@ms",
    padding: "10@s",
    marginTop: "10@vs",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: { color: "#8D939F", fontSize: "8@ms", textAlign: "left" },
  sectionTitle: {
    fontSize: "16@ms",
    fontWeight: "700",
    color: headerColor,
    marginTop: "20@vs",
  },
  optionCard: {
    backgroundColor: "white",
    borderRadius: "16@ms",
    padding: "14@s",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,
    borderColor: '#F2F0EF',
    marginTop: "10@vs",
  },
  optionSelected: { borderWidth: 2, borderColor: accentColor },
  optionTitle: { fontWeight: "700", color: headerColor, fontSize: "14@ms" },
  optionSubtitle: { color: headerColor, fontSize: "10@ms" },
  optionCost: {
    color: headerColor,
    fontWeight: "700",
    fontSize: "16@ms",
    marginTop: "4@vs",
  },
  radioOuter: {
    width: "20@ms",
    height: "20@ms",
    borderRadius: "10@ms",
    borderWidth: 2,
    borderColor: headerColor,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: "10@ms",
    height: "10@ms",
    borderRadius: "5@ms",
    backgroundColor: headerColor,
  },
  discountSection: {
    marginTop: "20@vs",
    backgroundColor: "white",
    borderRadius: "14@ms",
    padding: "16@s",
    elevation: 2,
  },
  discountLabel: {
    fontWeight: "700",
    fontSize: "16@ms",
    color: headerColor,
    textAlign: "center",
  },
  discountPercent: {
    fontSize: "34@ms",
    color: accentColor,
    fontWeight: "800",
    textAlign: "center",
  },
  discountSub: { color: "#6B7280", textAlign: "center", marginBottom: "8@vs" },
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  sliderContainer: {
    height: 16,
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 10,
  },

  sliderEdgeText: {
    fontSize: 14,
    color: '#333',
  },

  customTrackBackground: {
    position: 'absolute',
    height: 10,
    width: '100%',
    borderRadius: 5,
    backgroundColor: '#F2D7D7',
  },

  customTrackForeground: {
    height: '100%',
    borderRadius: 5,
  },

  transparentSlider: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  costBox: {
    backgroundColor: "#FDECEC",
    borderRadius: "10@ms",
    padding: "10@s",
    marginTop: "10@vs",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"

  },
  costTitle: { fontWeight: "700", color: headerColor, fontSize: "16@ms" },
  costPointTitle: { fontWeight: "300", color: headerColor, fontSize: "12@ms" },
  costPointValue: { color: headerColor, fontSize: "12@ms", fontWeight: "500" },

  costValue: { color: accentColor, fontSize: "17@ms", fontWeight: "700" },
  summaryBox: {
    backgroundColor: "#F3F3F5",
    borderRadius: "10@ms",
    padding: "10@s",
    marginTop: "20@vs",

  },
  summaryLine: {
    color: headerColor, marginVertical: "2@vs", flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  separator: {
    height: 1,
    backgroundColor: "#D1D5DB",
    marginVertical: "4@vs",
  },
  boxRenaming: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remaining: { fontSize: "16@ms", fontWeight: "700", textAlign: "right" },
  needMoreBox: {
    backgroundColor: "#E5E6EB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  CouponBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  needMoreText: {
    color: "#3F3F46",
    fontWeight: "700",
    fontSize: 13,
  },
  createBtn: {
    marginTop: "20@vs",
    backgroundColor: accentColor,
    borderRadius: "10@ms",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "12@vs",
  },
  createText: { color: "white", fontSize: "15@ms", fontWeight: "700" },
  keepText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: "8@vs",
    fontSize: "12@ms",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: "16@ms",
    paddingVertical: "30@vs",
    paddingHorizontal: "20@s",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  closeIconContainer: {
    position: 'absolute',
    top: "10@vs",
    left: "10@s",
    zIndex: 10,
    padding: "5@s",
  },
  modalTitle: {
    color: headerColor,
    fontWeight: "700",
    fontSize: "20@ms",
    marginTop: "10@vs",
  },
  modalSubtitle: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: "13@ms",
    marginTop: "8@vs",
  },
  modalCode: {
    color: accentColor,
    fontWeight: "700",
    fontSize: "16@ms",
    marginTop: "4@vs",
  },
  modalButton: {
    backgroundColor: accentColor,
    borderRadius: "10@ms",
    marginTop: "20@vs",
    paddingVertical: "10@vs",
    paddingHorizontal: "20@s",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: "14@ms",
  },
});

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
import { useTranslation } from "~/localization";

const accentColor = "#CA251B";
const headerColor = "#17213A";

const formatPointsValue = (value: number) => {
  if (!Number.isFinite(value)) return "0";
  const absolute = Math.abs(value);
  const fractionDigits = absolute % 1 === 0 ? 0 : 2;
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
};

export default function ConvertPointsScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const FREE_DELIVERY_COST = 250;
  const DISCOUNT_COST_PER_PERCENT = 15;

  const { data: balance, refetch, isFetching } = useQuery({
    queryKey: ["loyalty", "balance"],
    queryFn: getLoyaltyBalance,
  });

  const totalPoints = Number(balance?.balance ?? 0);
  const pointsUnit = t("profile.loyalty.pointsUnit");

  const [selectedCoupon, setSelectedCoupon] = useState<
    "FREE_DELIVERY" | "DISCOUNT" | null
  >(null);
  const [discountPercent, setDiscountPercent] = useState(20);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const remainingValue = totalPoints - cost;
  const remaining = formatPointsValue(remainingValue);
  const canCreate = Boolean(selectedCoupon) && remainingValue >= 0;
  const needsMorePoints = Boolean(selectedCoupon) && remainingValue < 0;

  const { mutateAsync: redeem, isPending } = useMutation({
    mutationFn: (payload: RedeemCouponRequest) =>
      redeemCouponWithPoints(payload),
    onSuccess: async (coupon) => {
      await queryClient.invalidateQueries({ queryKey: ["loyalty", "balance"] });
      await queryClient.invalidateQueries({
        queryKey: ["loyalty", "transactions"],
      });
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
        <Text allowFontScaling={false} style={styles.redCardTitle}>
          {t("profile.convert.availableTitle")}
        </Text>
        <Text allowFontScaling={false} style={styles.redCardValue}>
          {formatPointsValue(totalPoints)}
        </Text>
        <Text allowFontScaling={false} style={styles.redCardSubtitle}>
          {t("profile.convert.availableSubtitle")}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <CircleAlert color="#8D939F" size={20} />
        <Text allowFontScaling={false} style={styles.infoText}>
          {t("profile.convert.infoText")}
        </Text>
      </View>

      <Text allowFontScaling={false} style={styles.sectionTitle}>
        {t("profile.convert.selectTitle")}
      </Text>
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
              <Text allowFontScaling={false} style={styles.optionTitle}>
                {t("profile.convert.freeDelivery.title")}
              </Text>
              <Text allowFontScaling={false} style={styles.optionSubtitle}>
                {t("profile.convert.freeDelivery.description")}
              </Text>

              {selectedCoupon === "FREE_DELIVERY" && (
                <View style={styles.summaryLine}>
                  <Text
                    allowFontScaling={false}
                    style={{ fontSize: moderateScale(10), marginTop: verticalScale(10) }}
                  >
                    {t("profile.convert.freeDelivery.costLabel")}
                  </Text>
                  <Text allowFontScaling={false} style={styles.optionCost}>
                    {`${formatPointsValue(FREE_DELIVERY_COST)} ${pointsUnit}`}
                  </Text>
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
            <Text allowFontScaling={false} style={styles.optionTitle}>
              {t("profile.convert.percentage.title")}
            </Text>
            <Text allowFontScaling={false} style={styles.optionSubtitle}>
              {t("profile.convert.percentage.description", { values: { min: 5, max: 50 } })}
            </Text>
          </View>
        </View>
        <View style={styles.radioOuter}>
          {selectedCoupon === "DISCOUNT" && <View style={styles.radioDot} />}
        </View>
      </TouchableOpacity>

      {selectedCoupon === "DISCOUNT" && (
        <View style={styles.discountSection}>
          <Text allowFontScaling={false} style={styles.discountLabel}>
            {t("profile.redeem.percentageLabel")}
          </Text>
          <Text allowFontScaling={false} style={styles.discountPercent}>{discountPercent}%</Text>
          <Text allowFontScaling={false} style={styles.discountSub}>
            {t("profile.convert.discountLabel")}
          </Text>

          <View style={styles.sliderWrapper}>

            <Text allowFontScaling={false} style={styles.sliderEdgeText}>
              {t("profile.convert.sliderEdge", { values: { value: 5 } })}
            </Text>

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

            <Text allowFontScaling={false} style={styles.sliderEdgeText}>
              {t("profile.convert.sliderEdge", { values: { value: 50 } })}
            </Text>

          </View>
          <View style={styles.costBox}>
            <View>
              <Text allowFontScaling={false} style={styles.costPointTitle}>
                {t("profile.convert.costBox.pointCost")}
              </Text>
              <Text allowFontScaling={false} style={styles.costTitle}>
                {t("profile.convert.costBox.total")}
              </Text>
            </View>
            <View>
              <Text allowFontScaling={false} style={styles.costPointValue}>
                {t("profile.convert.costBox.multiplication", {
                  values: {
                    left: discountPercent,
                    right: DISCOUNT_COST_PER_PERCENT,
                    unit: pointsUnit,
                  },
                })}
              </Text>
              <Text allowFontScaling={false} style={styles.costValue}>
                {`${formatPointsValue(discountCost)} ${pointsUnit}`}
              </Text>

            </View>
          </View>
        </View>
      )}

      {selectedCoupon && (
        <View style={styles.summaryBox}>
          <View style={styles.summaryLine}>
            <Text allowFontScaling={false} style={{ color: "#666D8B" }}>
              {t("profile.convert.summary.yourPoints")}:
            </Text>
            <Text allowFontScaling={false} style={{ color: headerColor }}>
              {`${formatPointsValue(totalPoints)} ${pointsUnit}`}
            </Text>
          </View>
          <View style={styles.summaryLine}>
            <Text allowFontScaling={false} style={{ color: "#666D8B" }}>
              {t("profile.convert.summary.couponCost")}:
            </Text>
            <Text allowFontScaling={false} style={{ color: "#CA251B" }}>
              {`-${formatPointsValue(cost)} ${pointsUnit}`}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.boxRenaming} >
            <Text allowFontScaling={false} style={{ fontWeight: '600' }}>
              {t("profile.convert.summary.remaining")}
            </Text>
            <Text allowFontScaling={false} style={[
              styles.remaining,
              { color: remainingValue >= 0 ? "#3BCA1B" : "#CA251B" },
            ]}>{`${remaining} ${pointsUnit}`}</Text>
          </View>
        </View>
      )}

      {needsMorePoints && (
        <View style={styles.needMoreBox}>
          <Sparkles size={16} color="#6B7280" />
          <Text allowFontScaling={false} style={styles.needMoreText}>
            {t("profile.convert.needMore", {
              values: {
                value: `${formatPointsValue(Math.abs(remainingValue))} ${pointsUnit}`,
              },
            })}
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
              <Text allowFontScaling={false} style={styles.createText}>
                {t("profile.convert.createCta")}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <Text allowFontScaling={false} style={styles.keepText}>
        {t("profile.convert.keepEarning")}
      </Text>
    </ScrollView>
  );

  const header = (
    <View style={styles.header}>
      <HeaderWithBackButton
        title={t("profile.convert.headerTitle")}
        titleMarginLeft={s(70)}
      />
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
            <Text allowFontScaling={false} style={styles.modalTitle}>
              {t("profile.redeem.successTitle")}
            </Text>
            <Text allowFontScaling={false} style={styles.modalSubtitle}>
              {t("profile.redeem.successMessage")}
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

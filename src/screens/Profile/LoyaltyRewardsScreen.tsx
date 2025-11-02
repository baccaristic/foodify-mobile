import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { ScaledSheet, moderateScale, s, verticalScale, vs } from "react-native-size-matters";
import { ArrowRight } from "lucide-react-native";
import MainLayout from "~/layouts/MainLayout";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { getLoyaltyBalance, getLoyaltyTransactions } from "~/api/loyalty";
import type { LoyaltyTransactionDto } from "~/interfaces/Loyalty";
import HeaderWithBackButton from "~/components/HeaderWithBackButton";
import { Image, ImageBackground } from "expo-image";
import { useTranslation } from "~/localization";

const FOODY_IMAGE = require('../../../assets/foodypoints.png');
const WHEEL_IMAGE = require('../../../assets/luckywheel.png');
const BACKGROUND_WHEEL_IMAGE = require("../../../assets/LuckyWheelBackground.png");



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

export default function FoodyPointsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    data: balance,
    isFetching: isBalanceFetching,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ["loyalty", "balance"],
    queryFn: getLoyaltyBalance,
  });

  const {
    data: transactions = [],
    isFetching: isTransactionsFetching,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["loyalty", "transactions"],
    queryFn: getLoyaltyTransactions,
  });

  const refreshing = isBalanceFetching || isTransactionsFetching;
  const totalPoints = formatPointsValue(Number(balance?.balance ?? 0));
  const totalEarned = formatPointsValue(Number(balance?.lifetimeEarned ?? 0));
  const totalSpent = formatPointsValue(Number(balance?.lifetimeRedeemed ?? 0));

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions]);

  const renderTransaction = (item: LoyaltyTransactionDto) => {
    const value = Number(item.points);
    const isPositive = item.type === "EARNED" || value > 0;
    const formatted = formatPointsValue(value);
    const date = new Date(item.createdAt);
    const formattedDate = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);

    const fallbackTitle =
      item.type === "ADJUSTMENT"
        ? t("profile.loyalty.transactionTypes.adjustment")
        : isPositive
          ? t("profile.loyalty.transactionTypes.earned")
          : t("profile.loyalty.transactionTypes.redeemed");

    const localizedDescription = (() => {
      const description = item.description?.trim();

      if (!description) {
        return null;
      }

      const earnedMatch = description.match(
        /points? earned (?:for|from) order(?:\s*[:\-])?\s*(.+)/i,
      );
      if (earnedMatch) {
        return t("profile.loyalty.transactionDescriptions.earnedForOrder", {
          orderId: earnedMatch[1].trim(),
        });
      }

      const redeemedMatch = description.match(
        /redeemed points for coupon(?:\s*[:\-])?\s*(.+)/i,
      );
      if (redeemedMatch) {
        return t("profile.loyalty.transactionDescriptions.redeemedForCoupon", {
          couponCode: redeemedMatch[1].trim(),
        });
      }

      return description;
    })();

    return (
      <View style={styles.transactionRow} key={item.id}>
        <View style={{ flex: 1 }}>
          <Text allowFontScaling={false} style={styles.transactionTitle}>
            {localizedDescription || fallbackTitle}
          </Text>
          <Text allowFontScaling={false} style={styles.transactionDate}>{formattedDate}</Text>
        </View>

        <Text
          allowFontScaling={false}
          style={[
            styles.transactionValue,
            { color: isPositive ? "#3BCA1B" : accentColor },
          ]}
        >
          {formatted}
          {isPositive ? "" : ` ${t("profile.loyalty.pointsUnit")}`}
        </Text>
      </View>
    );
  };

  const mainContent = (
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={{
      flexGrow: 1,
      paddingHorizontal: moderateScale(16),
    }}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        colors={[accentColor]}
        onRefresh={() => {
          refetchBalance();
          refetchTransactions();
        }}
      />
    }
    showsVerticalScrollIndicator={false}
  >
    <View style={{ flex: 1 }}>
      <View style={styles.logoContainer}>
        <Image
          source={FOODY_IMAGE}
          style={{ width: 160, height: 160 }}
          contentFit="contain"
        />
      </View>

      <Text allowFontScaling={false} style={styles.tagline}>
        {t("profile.loyaltyDetails.tagline")}
      </Text>

      <View style={styles.pointsCard}>
        <View>
          <Text allowFontScaling={false} style={styles.smallLabel}>
            {t("profile.loyaltyDetails.totalPoints")}
          </Text>
          <Text allowFontScaling={false} style={styles.bigValue}>
            {totalPoints}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.convertBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ConvertPoints' as never)}
        >
          <Text allowFontScaling={false} style={styles.convertText}>
            {t("profile.loyaltyDetails.convertCta")}
          </Text>
          <ArrowRight size={s(16)} color="#CA251B" />
        </TouchableOpacity>
      </View>

      <View style={styles.dualRow}>
        <View style={styles.dualBox}>
          <Text allowFontScaling={false} style={styles.smallGray}>
            {t("profile.loyaltyDetails.totalEarned")}
          </Text>
          <Text allowFontScaling={false} style={styles.mediumDark}>
            {totalEarned}
          </Text>
        </View>

        <View style={styles.dualBox}>
          <Text allowFontScaling={false} style={styles.smallGray}>
            {t("profile.loyaltyDetails.totalSpent")}
          </Text>
          <Text allowFontScaling={false} style={styles.mediumDark}>
            {totalSpent}
          </Text>
        </View>
      </View>

      <View style={styles.luckyCard}>
        <ImageBackground
          source={WHEEL_IMAGE}
          style={{ width: 160, height: 160 }}
          contentFit="contain"
        />
        <Image
          source={BACKGROUND_WHEEL_IMAGE}
          style={styles.backgroundImage}
          contentFit="cover"
        />

        <View style={styles.luckyCardText}>
          <Text allowFontScaling={false} style={styles.availableText}>
            {t("profile.loyaltyDetails.availableIn")}
          </Text>
          <View style={styles.luckyBadge}>
            <Text allowFontScaling={false} style={styles.badgeText}>
              {t("profile.loyaltyDetails.availabilityBadge", { values: { count: 2 } })}
            </Text>
          </View>
          <Text allowFontScaling={false} style={styles.luckyHint}>
            {t("profile.loyaltyDetails.stayTuned")}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.howButton}>
        <Text allowFontScaling={false} style={styles.howText}>
          {t("profile.loyaltyDetails.howItWorks")}
        </Text>
      </TouchableOpacity>

      <View style={styles.transactionsList}>
        {isTransactionsFetching ? (
          <ActivityIndicator color={accentColor} />
        ) : sortedTransactions.length === 0 ? (
          <Text allowFontScaling={false} style={styles.emptyText}>
            {t("profile.loyalty.transactionsEmpty")}
          </Text>
        ) : (
          sortedTransactions.map(renderTransaction)
        )}
      </View>
    </View>
  </ScrollView>
);


  const header = (
    <View style={styles.header}>
      <HeaderWithBackButton
        title={t("profile.loyaltyDetails.headerTitle")}
        titleMarginLeft={s(70)}
      />
    </View>
  );

  return (
    <MainLayout
      showFooter
      showHeader
      customHeader={header}
      enableHeaderCollapse={false}
      enforceResponsiveHeaderSize={false}
      headerMaxHeight={vs(70)}
      headerMinHeight={vs(30)}
      activeTab="Profile"
      mainContent={mainContent}
    />
  );
}

const styles = ScaledSheet.create({
  header: { borderBottomColor: 'rgba(211,211,211,0.4)', borderBottomWidth: 2 },
  logoContainer: {
    alignItems: "center",
  },
  logoFoody: {
    fontSize: "42@ms",
    fontWeight: "700",
    color: headerColor,
    fontFamily: "serif",
  },
  logoPoints: {
    fontSize: "32@ms",
    color: accentColor,
    fontFamily: "serif",
    marginTop: "-10@vs",
  },
  tagline: {
    color: headerColor,
    fontSize: "10@ms",
    textAlign: "center",
    marginTop: "4@vs",
  },
  pointsCard: {
    marginTop: "16@vs",
    backgroundColor: "white",
    borderRadius: "16@ms",
    borderColor: "#F5F6F7",
    borderWidth: 2,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14@s",
  },
  smallLabel: {
    color: headerColor,
    fontSize: "13@ms",
  },
  bigValue: {
    fontSize: "20@ms",
    fontWeight: "700",
    color: headerColor,
    maxWidth: "200@ms"
  },
  convertBtn: {
    backgroundColor: '#F0BEBB',
    borderRadius: "12@ms",
    flexDirection: "row",
    alignItems: "center",
    gap: s(4),
    paddingVertical: "8@vs",
    paddingHorizontal: "12@s",
  },
  convertText: {
    color: accentColor,
    fontWeight: "600",
    fontSize: "13@ms",
  },
  dualRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "12@vs",
  },
  dualBox: {
    flex: 1,
    backgroundColor: "white",
    borderColor: "#F5F6F7",
    borderWidth: 2,
    borderRadius: "12@ms",
    paddingVertical: "16@vs",
    marginHorizontal: "16@s",
    alignItems: "center",
    elevation: 2,
    paddingHorizontal: moderateScale(16)

  },
  smallGray: { color: headerColor, fontSize: "12@ms", alignSelf: "flex-start" },
  mediumDark: { color: headerColor, fontWeight: "700", fontSize: "16@ms", alignSelf: "flex-start" },
  luckyCard: {
    backgroundColor: "#F3F3F5",
    borderRadius: "16@ms",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
    padding: "16@s",
    marginTop: "16@vs",
  },


  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  luckyCardText: {
    color: headerColor,
    fontWeight: "600",
    alignSelf: 'flex-end',
    marginBottom: verticalScale(24)
  },
  availableText: {
    color: headerColor,
    fontWeight: "600",
    alignSelf: 'flex-end'
  },
  luckyBadge: {
    backgroundColor: accentColor,
    paddingHorizontal: "10@s",
    paddingVertical: "4@vs",
    borderRadius: "10@ms",
    marginVertical: "4@vs",
  },
  badgeText: {
    color: "white",
    fontWeight: "700",
    fontSize: "13@ms",

  },
  luckyHint: {
    color: headerColor,
    fontSize: "12@ms",

  },
  howButton: {
    backgroundColor: "#17213A",
    borderRadius: "20@ms",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "20@vs",
    paddingVertical: "10@vs",
    paddingHorizontal: "12@s",
  },
  howText: {
    color: "white",
    fontSize: "14@ms",
    fontWeight: "700",
  },
  transactionsList: {
    marginTop: "18@vs",

  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: "10@vs",
    borderBottomWidth: 1,
    borderBottomColor: accentColor,
  },
  transactionTitle: {
    color: headerColor,
    fontSize: "14@ms",
    fontWeight: "600",
  },
  transactionDate: {
    color: "#6B7280",
    fontSize: "12@ms",
  },
  transactionValue: {
    fontSize: "15@ms",
    fontWeight: "700",
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: "20@vs",
  },
});


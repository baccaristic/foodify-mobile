import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { ArrowRight, Check, TicketPercent, CircleArrowRight } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getLoyaltyCoupons, getLoyaltyBalance } from '~/api/loyalty';
import type { CouponDto } from '~/interfaces/Loyalty';
import { useTranslation } from '~/localization';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import { ScaledSheet, moderateScale, s } from 'react-native-size-matters';

const headerColor = '#17213A';
const accentColor = '#CA251B';
const borderColor = '#E8E9EC';

const CouponCodeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const {
    data: coupons = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['loyalty', 'coupons'],
    queryFn: getLoyaltyCoupons,
  });

  const {
    data: balanceData,
    isFetching: isBalanceFetching,
  } = useQuery({
    queryKey: ['loyalty', 'balance'],
    queryFn: getLoyaltyBalance,
  });

  const formatPoints = (v: number) => {
    const abs = Math.abs(v);
    const fractionDigits = abs % 1 === 0 ? 0 : 2;
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: 2,
    }).format(v);
  };

  const pointsDisplay = formatPoints(Number(balanceData?.balance ?? 0));

  const sortedCoupons = useMemo(
    () =>
      [...coupons].sort((a, b) => {
        const left = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
        const right = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
        return right - left;
      }),
    [coupons],
  );

  const renderCoupon = ({ item }: { item: CouponDto }) => {
    let statusLabel = '';
    let bgButton = accentColor;
    let textColor = 'white';
    let IconComponent = ArrowRight;

    if (item.redeemed) {
      statusLabel = t('profile.coupon.status.redeemed'); 
      bgButton = '#D1D5DB';
      textColor = '#fff';
      IconComponent = Check;
    } else if (item.active) {
      statusLabel = t('profile.coupon.status.active'); 
    } else {
      statusLabel = t('profile.coupon.status.inactive'); 
    }

    const discountLabel =
      item.type === 'PERCENTAGE_DISCOUNT'
        ? t('profile.coupon.discount.percent', { values: { value: item.discountPercent ?? 0 } })
        : t('profile.coupon.discount.freeDelivery');

    const creationDate = item.assignedAt
      ? new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(item.assignedAt))
      : null;


    return (
      <View
        className="mb-3 flex-row items-center justify-between rounded-3xl border bg-white px-4 py-4"
        style={{ borderColor, borderWidth:2 }}
      >
        <View className="flex-row items-center flex-1 pr-3">
          <View className="mr-4 h-10 w-10 items-center justify-center rounded-2xl bg-[#FDE7E5]">
            <TicketPercent size={20} color={accentColor} />
          </View>

          <View style={{ flex: 1 }}>
            <Text allowFontScaling={false} className="text-base font-semibold" style={{ color: accentColor }}>
              {discountLabel}
            </Text>

            <Text allowFontScaling={false} className="text-xs font-semibold mt-1" style={{ color: '#9CA3AF' }}>
              {item.code}
            </Text>

            {creationDate ? (
              <Text allowFontScaling={false} className="mt-1 text-xs font-semibold" style={{ color: accentColor }}>
                {t('profile.coupon.assignedAt', { values: { date: creationDate } })}
              </Text>
            ) : null}
          </View>
        </View>

        <View>
          <View
            className="flex-row items-center justify-center rounded-full px-3 py-2"
            style={{ backgroundColor: bgButton, minWidth: 90 }}
          >
            <Text allowFontScaling={false} className="text-xs font-semibold mr-1" style={{ color: textColor }}>
              {statusLabel}
            </Text>
            <IconComponent size={14} color={textColor} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View style={styles.header}>
        <HeaderWithBackButton title={t('profile.coupon.title')} />
      </View>

      <FlatList
        data={sortedCoupons}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <View className="mb-4">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('LoyaltyRewards' as never)}
              className="flex-row items-center justify-between rounded-3xl bg-[#CA251B] px-6 py-5"
            >
              <View>
                <Text allowFontScaling={false} className="text-white font-medium text-sm">
                  {t('profile.convert.availableTitle')}
                </Text>

                {isBalanceFetching ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text allowFontScaling={false} className="text-white font-extrabold text-2xl mt-1">
                    {pointsDisplay}
                  </Text>
                )}

                <Text allowFontScaling={false} className="text-white font-semibold text-sm mt-1" style={{maxWidth:moderateScale(220)}}>
                  {t('profile.convert.availableSubtitle')}
                </Text>
              </View>
              <CircleArrowRight size={48} color="white" />
            </TouchableOpacity>

            <Text allowFontScaling={false} className="mt-6 text-lg font-extrabold" style={{ color: headerColor }}>
              {t('profile.coupon.listTitle')}
            </Text>
          </View>
        }
        renderItem={renderCoupon}
        ListFooterComponent={
          <View className="mt-6 px-3">
            <Text allowFontScaling={false} className="text-center text-sm" style={{ color: '#9CA3AF' }}>
              {t('profile.coupon.emptyHint')}
            </Text>
          </View>
        }
        ListEmptyComponent={() => (
          <View className="mt-10 items-center">
            {isLoading ? (
              <ActivityIndicator color={accentColor} />
            ) : (
              <Text allowFontScaling={false} className="text-center text-sm" style={{ color: '#6B7280' }}>
                {t('profile.coupon.emptyHint')}
              </Text>
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            colors={[accentColor]}
            tintColor={accentColor}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['loyalty', 'coupons'] });
              queryClient.invalidateQueries({ queryKey: ['loyalty', 'balance'] });
            }}
          />
        }
      />
    </SafeAreaView>
  );
};

export default CouponCodeScreen;

const styles = ScaledSheet.create({
  header: {
    borderBottomColor: 'rgba(211,211,211,0.4)',
    borderBottomWidth: 2,
  },
});

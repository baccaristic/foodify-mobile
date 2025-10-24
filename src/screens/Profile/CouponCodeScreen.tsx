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
import { ArrowLeft, Gift, Sparkles } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getLoyaltyCoupons } from '~/api/loyalty';
import type { CouponDto } from '~/interfaces/Loyalty';
import { useTranslation } from '~/localization';

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
    const statusKey = item.redeemed
      ? 'redeemed'
      : item.active
      ? 'active'
      : 'inactive';

    const statusLabel = t(`profile.coupon.status.${statusKey}`);
    const statusColor = item.redeemed ? '#6B7280' : item.active ? '#16A34A' : accentColor;
    const discountLabel =
      item.type === 'PERCENTAGE_DISCOUNT'
        ? t('profile.coupon.discount.percent', { values: { value: item.discountPercent ?? 0 } })
        : t('profile.coupon.discount.freeDelivery');
    const assignedDate = item.assignedAt
      ? new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(item.assignedAt))
      : null;

    return (
      <View className="mb-3 rounded-3xl border bg-white p-5" style={{ borderColor }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text allowFontScaling={false} className="text-base font-semibold" style={{ color: headerColor }}>
              {item.code}
            </Text>
            <Text allowFontScaling={false} className="mt-1 text-sm" style={{ color: '#6B7280' }}>
              {discountLabel}
            </Text>
            {assignedDate ? (
              <Text allowFontScaling={false} className="mt-2 text-xs" style={{ color: '#9CA3AF' }}>
                {t('profile.coupon.assignedAt', { values: { date: assignedDate } })}
              </Text>
            ) : null}
            {item.createdFromPoints ? (
              <View className="mt-3 self-start rounded-full bg-[#FDE7E5] px-3 py-1">
                <Text allowFontScaling={false} className="text-xs font-semibold" style={{ color: accentColor }}>
                  {t('profile.coupon.createdFromPoints')}
                </Text>
              </View>
            ) : null}
          </View>
          <View className="items-end">
            <Gift size={24} color={accentColor} />
            <Text allowFontScaling={false} className="mt-2 text-xs font-semibold" style={{ color: statusColor }}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pb-4 pt-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-4 rounded-full border border-[#E4E6EB] p-2"
        >
          <ArrowLeft size={20} color={headerColor} />
        </TouchableOpacity>
        <Text allowFontScaling={false} className="flex-1 text-center text-xl font-bold" style={{ color: headerColor }}>
          {t('profile.coupon.title')}
        </Text>
        <View className="w-10" />
      </View>

      <FlatList
        data={sortedCoupons}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text allowFontScaling={false} className="text-sm" style={{ color: '#6B7280' }}>
              {t('profile.coupon.subtitle')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('RedeemCoupon' as never)}
              className="mt-4 flex-row items-center justify-between rounded-3xl bg-[#FDE7E5] px-5 py-4"
            >
              <View>
                <Text allowFontScaling={false} className="text-base font-semibold" style={{ color: accentColor }}>
                  {t('profile.coupon.redeemCta')}
                </Text>
                <Text allowFontScaling={false} className="mt-1 text-xs" style={{ color: '#B91C1C' }}>
                  {t('profile.coupon.redeemHint')}
                </Text>
              </View>
              <Sparkles size={20} color={accentColor} />
            </TouchableOpacity>

            <Text allowFontScaling={false} className="mt-6 text-base font-bold" style={{ color: headerColor }}>
              {t('profile.coupon.listTitle')}
            </Text>
          </View>
        }
        renderItem={renderCoupon}
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
            }}
          />
        }
      />
    </SafeAreaView>
  );
};

export default CouponCodeScreen;

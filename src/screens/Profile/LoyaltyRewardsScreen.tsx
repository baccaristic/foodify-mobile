import React, { useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getLoyaltyBalance, getLoyaltyTransactions } from '~/api/loyalty';
import type { LoyaltyTransactionDto } from '~/interfaces/Loyalty';
import { useTranslation } from '~/localization';

const accentColor = '#CA251B';
const headerColor = '#17213A';
const dividerColor = '#EAECF0';

const formatPointsValue = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }

  const absolute = Math.abs(value);
  const fractionDigits = absolute % 1 === 0 ? 0 : 2;
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
};

const LoyaltyRewardsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const {
    data: balance,
    isFetching: isBalanceFetching,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['loyalty', 'balance'],
    queryFn: getLoyaltyBalance,
    staleTime: 60_000,
  });

  const {
    data: transactions = [],
    isLoading: isTransactionsLoading,
    isFetching: isTransactionsFetching,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ['loyalty', 'transactions'],
    queryFn: getLoyaltyTransactions,
  });

  useFocusEffect(
    useCallback(() => {
      refetchBalance();
      refetchTransactions();
    }, [refetchBalance, refetchTransactions]),
  );

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const left = new Date(a.createdAt).getTime();
      const right = new Date(b.createdAt).getTime();
      return right - left;
    });
  }, [transactions]);

  const renderTransaction = ({ item }: { item: LoyaltyTransactionDto }) => {
    const pointsValue = Number(item.points);
    const isPositive = pointsValue >= 0;
    const formattedPoints = formatPointsValue(pointsValue);
    const timestamp = new Date(item.createdAt);
    const formattedDate = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(timestamp);

    const typeLabel = t(`profile.loyalty.transactionTypes.${item.type.toLowerCase()}`);

    return (
      <View className="px-5 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text allowFontScaling={false} className="text-sm font-semibold" style={{ color: headerColor }}>
              {item.description || typeLabel}
            </Text>
            <Text allowFontScaling={false} className="mt-1 text-xs" style={{ color: '#6B7280' }}>
              {formattedDate}
            </Text>
          </View>
          <Text
            allowFontScaling={false}
            className="text-base font-semibold"
            style={{ color: isPositive ? '#16A34A' : accentColor }}
          >
            {isPositive ? '+' : ''}
            {formattedPoints}
          </Text>
        </View>
      </View>
    );
  };

  const balanceValue = Number.isFinite(balance?.balance ?? 0) ? balance?.balance ?? 0 : 0;
  const formattedBalance = formatPointsValue(balanceValue);
  const lifetimeEarned = formatPointsValue(Number(balance?.lifetimeEarned ?? 0));
  const lifetimeRedeemed = formatPointsValue(Number(balance?.lifetimeRedeemed ?? 0));

  const refreshing = isBalanceFetching || isTransactionsFetching;

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
          {t('profile.loyalty.title')}
        </Text>
        <View className="w-10" />
      </View>

      <FlatList
        data={sortedTransactions}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View className="px-5 pb-4">
            <View className="rounded-3xl bg-[#17213A] p-5">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text allowFontScaling={false} className="text-xs uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {t('profile.loyalty.balanceLabel')}
                  </Text>
                  <Text allowFontScaling={false} className="mt-2 text-3xl font-bold text-white">
                    {formattedBalance}
                  </Text>
                </View>
                <Sparkles size={36} color="#FCD34D" />
              </View>
              <Text allowFontScaling={false} className="mt-4 text-sm text-white/80">
                {t('profile.loyalty.subtitle')}
              </Text>
            </View>

            <View className="mt-4 flex-row gap-3">
              <View className="flex-1 rounded-3xl border border-[#F1F2F4] bg-white p-4">
                <Text allowFontScaling={false} className="text-xs uppercase" style={{ color: '#6B7280' }}>
                  {t('profile.loyalty.lifetimeEarned')}
                </Text>
                <Text allowFontScaling={false} className="mt-2 text-lg font-semibold" style={{ color: headerColor }}>
                  {lifetimeEarned}
                </Text>
              </View>
              <View className="flex-1 rounded-3xl border border-[#F1F2F4] bg-white p-4">
                <Text allowFontScaling={false} className="text-xs uppercase" style={{ color: '#6B7280' }}>
                  {t('profile.loyalty.lifetimeRedeemed')}
                </Text>
                <Text allowFontScaling={false} className="mt-2 text-lg font-semibold" style={{ color: headerColor }}>
                  {lifetimeRedeemed}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('RedeemCoupon' as never)}
              className="mt-4 flex-row items-center justify-between rounded-3xl bg-[#FDE7E5] px-5 py-4"
            >
              <View>
                <Text allowFontScaling={false} className="text-base font-semibold" style={{ color: accentColor }}>
                  {t('profile.loyalty.redeemCta')}
                </Text>
                <Text allowFontScaling={false} className="mt-1 text-xs" style={{ color: '#B91C1C' }}>
                  {t('profile.loyalty.redeemHint')}
                </Text>
              </View>
              <ArrowRight size={20} color={accentColor} />
            </TouchableOpacity>

            <Text allowFontScaling={false} className="mt-6 text-base font-bold" style={{ color: headerColor }}>
              {t('profile.loyalty.transactionsTitle')}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: dividerColor }} />}
        renderItem={renderTransaction}
        ListEmptyComponent={() => (
          <View className="px-5 pb-10">
            {isTransactionsLoading ? (
              <ActivityIndicator color={accentColor} />
            ) : (
              <Text allowFontScaling={false} className="text-sm" style={{ color: '#6B7280' }}>
                {t('profile.loyalty.transactionsEmpty')}
              </Text>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            tintColor={accentColor}
            colors={[accentColor]}
            refreshing={refreshing}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['loyalty', 'balance'] });
              queryClient.invalidateQueries({ queryKey: ['loyalty', 'transactions'] });
            }}
          />
        }
      />
    </SafeAreaView>
  );
};

export default LoyaltyRewardsScreen;

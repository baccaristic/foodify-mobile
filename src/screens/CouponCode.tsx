import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, Gift, XCircle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

import { getLoyaltyCoupons } from '~/api/loyalty';
import type { CouponDto } from '~/interfaces/Loyalty';
import { useTranslation } from '~/localization';

const sectionTitleColor = '#17213A';
const accentColor = '#CA251B';
const borderColor = '#E8E9EC';

type CouponStatus = 'idle' | 'success' | 'error';

type RouteParams = {
  currentCode?: string;
};

type CouponRoute = RouteProp<{ CouponCode: RouteParams }, 'CouponCode'>;

const CouponCode: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<CouponRoute>();
  const [couponCode, setCouponCode] = useState(route.params?.currentCode ?? '');
  const [status, setStatus] = useState<CouponStatus>('idle');
  const { t } = useTranslation();

  const {
    data: coupons = [],
    isLoading,
  } = useQuery({
    queryKey: ['loyalty', 'coupons'],
    queryFn: getLoyaltyCoupons,
  });

  const availableCoupons = useMemo(
    () => coupons.filter((coupon) => coupon.active && !coupon.redeemed),
    [coupons],
  );

  const helperText = useMemo(() => {
    if (status === 'success') {
      return t('coupon.status.success');
    }

    if (status === 'error') {
      return t('coupon.status.error');
    }

    return '';
  }, [status, t]);

  const helperColor = status === 'success' ? '#22C55E' : status === 'error' ? accentColor : '#9CA3AF';

  const applyCoupon = (coupon: CouponDto) => {
    navigation.navigate({
      name: 'CheckoutOrder',
      params: {
        couponCode: coupon.code,
        couponValid: true,
        couponType: coupon.type,
        couponDiscountPercent: coupon.discountPercent ?? null,
      },
      merge: true,
    });
  };

  const handleCheckCoupon = () => {
    if (!couponCode.trim()) {
      setStatus('error');
      return;
    }

    const normalizedCode = couponCode.trim().toUpperCase();
    setCouponCode(normalizedCode);

    const match = coupons.find((coupon) => coupon.code.toUpperCase() === normalizedCode);

    if (match && match.active && !match.redeemed) {
      setStatus('success');
      applyCoupon(match);
      return;
    }

    setStatus('error');
  };

  const renderCoupon = ({ item }: { item: CouponDto }) => {
    const discountLabel =
      item.type === 'PERCENTAGE'
        ? t('coupon.list.percent', { values: { value: item.discountPercent ?? 0 } })
        : t('coupon.list.freeDelivery');

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => applyCoupon(item)}
        className="mb-3 flex-row items-center justify-between rounded-3xl border bg-white p-4"
        style={{ borderColor }}
      >
        <View className="flex-1 pr-4">
          <Text allowFontScaling={false} className="text-base font-semibold" style={{ color: sectionTitleColor }}>
            {item.code}
          </Text>
          <Text allowFontScaling={false} className="mt-1 text-sm" style={{ color: '#6B7280' }}>
            {discountLabel}
          </Text>
        </View>
        <Gift size={22} color={accentColor} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pb-4 pt-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-4 rounded-full border border-[#E4E6EB] p-2"
        >
          <ArrowLeft size={20} color={sectionTitleColor} />
        </TouchableOpacity>
        <Text allowFontScaling={false} className="flex-1 text-center text-xl font-bold" style={{ color: sectionTitleColor }}>
          {t('coupon.title')}
        </Text>
        <View className="w-10" />
      </View>

      <View className="px-6">
        <Text allowFontScaling={false} className="text-sm font-semibold" style={{ color: sectionTitleColor }}>
          {t('coupon.subtitle')}
        </Text>
        <View className="mt-3 rounded-3xl border px-5 py-4" style={{ borderColor }}>
          <TextInput
            allowFontScaling={false}
            placeholder={t('coupon.placeholder')}
            placeholderTextColor="#9CA3AF"
            value={couponCode}
            onChangeText={(value) => {
              setCouponCode(value);
              setStatus('idle');
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            className="text-base text-[#17213A]"
          />
        </View>

        {helperText ? (
          <View className="mt-4 flex-row items-center">
            {status === 'success' ? (
              <CheckCircle2 size={18} color={helperColor} />
            ) : (
              <XCircle size={18} color={helperColor} />
            )}
            <Text allowFontScaling={false} className="ml-2 text-sm" style={{ color: helperColor }}>
              {helperText}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="px-6 pt-4">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleCheckCoupon}
          className="rounded-full bg-[#CA251B] px-6 py-4"
        >
          <Text allowFontScaling={false} className="text-center text-base font-semibold text-white">
            {t('coupon.checkCta')}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mt-4 flex-1 px-6">
        <Text allowFontScaling={false} className="text-sm font-semibold" style={{ color: sectionTitleColor }}>
          {t('coupon.listTitle')}
        </Text>
        {isLoading ? (
          <View className="mt-6 items-center">
            <ActivityIndicator color={accentColor} />
          </View>
        ) : availableCoupons.length ? (
          <FlatList
            data={availableCoupons}
            keyExtractor={(item) => item.code}
            renderItem={renderCoupon}
            contentContainerStyle={{ paddingVertical: 12 }}
          />
        ) : (
          <Text allowFontScaling={false} className="mt-4 text-sm" style={{ color: '#6B7280' }}>
            {t('coupon.emptyList')}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CouponCode;

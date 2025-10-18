import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute, NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react-native';
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

  const handleCheckCoupon = () => {
    if (!couponCode.trim()) {
      setStatus('error');
      return;
    }

    const normalizedCode = couponCode.trim().toUpperCase();
    setCouponCode(normalizedCode);

    if (normalizedCode === 'ABCDE123') {
      setStatus('success');
      navigation.navigate({
        name: 'CheckoutOrder',
        params: {
          couponCode: normalizedCode,
          discountAmount: 5,
          couponValid: true,
        },
        merge: true,
      });
      return;
    }

    setStatus('error');
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

      <View className="flex-1 px-6">
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

      <View className="px-6 pb-6">
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
    </SafeAreaView>
  );
};

export default CouponCode;

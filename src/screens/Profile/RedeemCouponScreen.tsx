import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { ArrowLeft, BadgePercent, Truck } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { redeemCouponWithPoints } from '~/api/loyalty';
import type { CouponType } from '~/interfaces/Loyalty';
import { useTranslation } from '~/localization';

const accentColor = '#CA251B';
const headerColor = '#17213A';
const borderColor = '#E4E6EB';

const MIN_PERCENT = 5;
const MAX_PERCENT = 50;

const RedeemCouponScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<CouponType>('FREE_DELIVERY');
  const [percentValue, setPercentValue] = useState('10');
  const [error, setError] = useState<string | null>(null);

  const redemptionDetails = useMemo(
    () => ({
      FREE_DELIVERY: {
        icon: Truck,
        title: t('profile.redeem.options.freeDelivery.title'),
        description: t('profile.redeem.options.freeDelivery.description'),
      },
      PERCENTAGE: {
        icon: BadgePercent,
        title: t('profile.redeem.options.percentage.title'),
        description: t('profile.redeem.options.percentage.description'),
      },
    }),
    [t],
  );

  const mutation = useMutation({
    mutationFn: redeemCouponWithPoints,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'coupons'] });
      Alert.alert(t('profile.redeem.successTitle'), t('profile.redeem.successMessage'));
      navigation.goBack();
    },
    onError: (error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error instanceof Error ? error.message : null) ||
        t('profile.redeem.errorMessage');
      Alert.alert(t('profile.redeem.errorTitle'), message);
    },
  });

  const handleSubmit = () => {
    if (selectedType === 'PERCENTAGE') {
      const parsed = Number(percentValue);
      if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
        setError(t('profile.redeem.errors.invalidNumber'));
        return;
      }
      if (parsed < MIN_PERCENT || parsed > MAX_PERCENT) {
        setError(t('profile.redeem.errors.outOfRange', { values: { min: MIN_PERCENT, max: MAX_PERCENT } }));
        return;
      }
      setError(null);
      mutation.mutate({ type: 'PERCENTAGE', discountPercent: parsed });
      return;
    }

    setError(null);
    mutation.mutate({ type: 'FREE_DELIVERY' });
  };

  const OptionCard = ({ type }: { type: CouponType }) => {
    const isSelected = selectedType === type;
    const details = redemptionDetails[type];
    const Icon = details.icon;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          setSelectedType(type);
          if (type !== 'PERCENTAGE') {
            setError(null);
          }
        }}
        className="mb-3 flex-row items-center rounded-3xl border px-4 py-4"
        style={{
          borderColor: isSelected ? accentColor : borderColor,
          backgroundColor: isSelected ? '#FFF5F4' : 'white',
        }}
      >
        <View
          className="mr-4 h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: isSelected ? accentColor : '#F5F6F8' }}
        >
          <Icon size={22} color={isSelected ? 'white' : accentColor} />
        </View>
        <View className="flex-1">
          <Text allowFontScaling={false} className="text-base font-semibold" style={{ color: headerColor }}>
            {details.title}
          </Text>
          <Text allowFontScaling={false} className="mt-1 text-sm" style={{ color: '#6B7280' }}>
            {details.description}
          </Text>
        </View>
        <View
          className="h-5 w-5 items-center justify-center rounded-full border"
          style={{
            borderColor: isSelected ? accentColor : '#CBD2D9',
            backgroundColor: isSelected ? accentColor : 'white',
          }}
        >
          {isSelected ? <View className="h-2.5 w-2.5 rounded-full bg-white" /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={64}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
          <View className="flex-row items-center px-4 pb-4 pt-2">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4 rounded-full border border-[#E4E6EB] p-2"
            >
              <ArrowLeft size={20} color={headerColor} />
            </TouchableOpacity>
            <Text allowFontScaling={false} className="flex-1 text-center text-xl font-bold" style={{ color: headerColor }}>
              {t('profile.redeem.title')}
            </Text>
            <View className="w-10" />
          </View>

          <View className="px-5">
            <Text allowFontScaling={false} className="text-sm" style={{ color: '#6B7280' }}>
              {t('profile.redeem.subtitle')}
            </Text>

            <View className="mt-5">
              <OptionCard type="FREE_DELIVERY" />
              <OptionCard type="PERCENTAGE" />
            </View>

            {selectedType === 'PERCENTAGE' ? (
              <View className="mt-4 rounded-3xl border px-4 py-4" style={{ borderColor }}>
                <Text allowFontScaling={false} className="text-sm font-semibold" style={{ color: headerColor }}>
                  {t('profile.redeem.percentageLabel')}
                </Text>
                <TextInput
                  allowFontScaling={false}
                  keyboardType="numeric"
                  value={percentValue}
                  onChangeText={(value) => {
                    setPercentValue(value.replace(/[^0-9.]/g, ''));
                    setError(null);
                  }}
                  placeholder={`${MIN_PERCENT}`}
                  placeholderTextColor="#9CA3AF"
                  className="mt-2 text-base text-[#17213A]"
                />
                <Text allowFontScaling={false} className="mt-2 text-xs" style={{ color: '#6B7280' }}>
                  {t('profile.redeem.percentageHint', { values: { min: MIN_PERCENT, max: MAX_PERCENT } })}
                </Text>
                {error ? (
                  <Text allowFontScaling={false} className="mt-2 text-xs" style={{ color: accentColor }}>
                    {error}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSubmit}
              disabled={mutation.isPending}
              className="mt-6 rounded-full bg-[#CA251B] px-6 py-4"
              style={{ opacity: mutation.isPending ? 0.7 : 1 }}
            >
              <Text allowFontScaling={false} className="text-center text-base font-semibold text-white">
                {mutation.isPending ? t('profile.redeem.submitting') : t('profile.redeem.submitCta')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RedeemCouponScreen;

import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import MainLayout from '~/layouts/MainLayout';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import { useTranslation } from '~/localization';

const palette = {
  accent: '#CA251B',
  accentDark: '#17213A',
};

const CouponCodeScreen = () => {
  const { t } = useTranslation();

  const customHeader = (
    <View style={styles.header}>
      <HeaderWithBackButton title={t('profile.coupon.title')} titleMarginLeft={s(70)} />
    </View>
  );

  const mainContent = (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text allowFontScaling={false} style={styles.label}>{t('profile.coupon.addLabel')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('profile.coupon.placeholder')}
        placeholderTextColor="#999"
      />

      <Text allowFontScaling={false} style={styles.subTitle}>{t('profile.coupon.listTitle')}</Text>
      <View style={styles.divider} />

      <Text allowFontScaling={false} style={styles.infoText}>{t('profile.coupon.emptyHint')}</Text>
    </ScrollView>
  );

  return (
    <MainLayout
      showHeader
      showFooter
      collapsedHeader={false}
      enableHeaderCollapse={false}
      headerMaxHeight={vs(70)}
      headerMinHeight={vs(30)}
      activeTab="Profile"
      enforceResponsiveHeaderSize={false}
      customHeader={customHeader}
      mainContent={mainContent}
    />
  );
};

const styles = ScaledSheet.create({
  header: { borderBottomColor: 'rgba(211,211,211,0.4)', borderBottomWidth: 2 },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: '16@s',
  },
  label: {
    color: palette.accentDark,
    fontWeight: '600',
    fontSize: '16@ms',
    marginBottom: '8@vs',
  },
  input: {
    borderRadius: '6@ms',
    backgroundColor: '#F2F2F2',
    height: '45@vs',
    marginBottom: '18@vs',
    paddingHorizontal: '10@s',
  },
  subTitle: {
    color: palette.accentDark,
    fontWeight: '700',
    fontSize: '15@ms',
    marginBottom: '6@vs',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5E5',
    marginBottom: '12@vs',
  },
  infoText: {
    color: palette.accentDark,
    fontSize: '14@ms',
    lineHeight: '20@ms',
  },
});

export default CouponCodeScreen;

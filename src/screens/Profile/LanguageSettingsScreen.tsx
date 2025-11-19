import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScaledSheet, moderateScale, s, vs } from 'react-native-size-matters';
import { Check, Languages } from 'lucide-react-native';
import MainLayout from '~/layouts/MainLayout';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import { availableLocales, useLocalization, useTranslation } from '~/localization';

const palette = {
  accent: '#CA251B',
  accentDark: '#17213A',
  muted: '#6B7280',
};

const LanguageSettingsScreen = () => {
  const { locale, setLocale } = useLocalization();
  const { t } = useTranslation();

  const handleSelect = useCallback(
    (nextLocale: typeof locale) => {
      if (locale !== nextLocale) {
        setLocale(nextLocale);
      }
    },
    [locale, setLocale],
  );

  const customHeader = (
    <View style={styles.header}>
      <HeaderWithBackButton title={t('profile.language.title')}  />
    </View>
  );

  const mainContent = (
    <View style={styles.container}>
      <Text allowFontScaling={false} style={styles.heading}>
        {t('profile.language.heading')}
      </Text>
      <Text allowFontScaling={false} style={styles.description}>
        {t('profile.language.description')}
      </Text>

      <View style={styles.list}>
        {availableLocales.map((option) => {
          const isActive = option.value === locale;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, isActive && styles.optionActive]}
              activeOpacity={0.85}
              onPress={() => handleSelect(option.value)}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Languages size={s(18)} color={isActive ? palette.accent : palette.accentDark} />
                </View>
                <View>
                  <Text allowFontScaling={false} style={styles.optionLabel}>
                    {t(`profile.language.options.${option.value}`, { defaultValue: option.label })}
                  </Text>
                  <Text allowFontScaling={false} style={styles.optionHint} numberOfLines={2}>
                    {t(`profile.language.hints.${option.value}`, { defaultValue: option.label })}
                  </Text>
                </View>
              </View>

              {isActive ? (
                <View style={styles.checkMark}>
                  <Check size={s(16)} color="#FFFFFF" />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text allowFontScaling={false} style={styles.note}>
        {t('profile.language.note')}
      </Text>
    </View>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: '18@s',
    gap: '16@vs',
  },
  heading: {
    fontSize: '20@ms',
    fontWeight: '700',
    color: palette.accentDark,
  },
  description: {
    fontSize: '14@ms',
    color: palette.muted,
    lineHeight: '20@ms',
  },
  list: {
    gap: '12@vs',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(23,33,58,0.1)',
    borderRadius: '16@ms',
    paddingHorizontal: '16@s',
    paddingVertical: '14@vs',
    backgroundColor: '#FFFFFF',
  },
  optionActive: {
    borderColor: palette.accent,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@s',
  },
  optionIcon: {
    width: '40@s',
    height: '40@s',
    borderRadius: '20@s',
    backgroundColor: 'rgba(202,37,27,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: palette.accentDark,
  },
  optionHint: {
    fontSize: '12@ms',
    color: palette.muted,
    marginTop: '2@vs',
    maxWidth:moderateScale(208)
  },
  checkMark: {
    width: '28@s',
    height: '28@s',
    borderRadius: '14@s',
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    fontSize: '12@ms',
    color: palette.muted,
    lineHeight: '18@ms',
  },
});

export default LanguageSettingsScreen;

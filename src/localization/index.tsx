import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { I18nManager } from 'react-native';
import * as ExpoLocalization from 'expo-localization';
import type { Locale, TranslationDictionary, TranslationResources } from './types';
import en from './resources/en';
import fr from './resources/fr';
import ar from './resources/ar';

const resources: TranslationResources = {
  en,
  fr,
  ar
};

type TranslateOptions = {
  defaultValue?: string;
  values?: Record<string, string | number>;
};

type LocalizationContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: TranslateOptions) => string;
  isRTL: boolean;
};

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

const getNestedValue = (dictionary: TranslationDictionary, key: string): string | undefined => {
  const parts = key.split('.');
  let current: TranslationDictionary | string | undefined = dictionary;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
};

const resolveInitialLocale = (): Locale => {
  const locales = ExpoLocalization.getLocales();
  if (locales.length > 0) {
    const primary = locales[0];
    switch (primary.languageCode?.toLowerCase()) {
      case 'fr':
        return 'fr';

      case 'ar':
        return 'ar';
      case 'en':
      default:
        return 'en';
    }
  }
  return 'en';
};

const interpolate = (template: string, values?: Record<string, string | number>) => {
  if (!values) {
    return template;
  }

  return template.replace(/{{(\w+)}}/g, (_, token: string) => {
    const value = values[token];
    return value === undefined || value === null ? '' : String(value);
  });
};

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(resolveInitialLocale());
  const [isRTL, setIsRTL] = useState<boolean>(resolveInitialLocale() === 'ar');

  const handleSetLocale = useCallback((newLocale: Locale) => {
    const shouldBeRTL = newLocale === 'ar';
    
    // Update RTL mode if it has changed
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
      I18nManager.allowRTL(shouldBeRTL);
    }
    
    setIsRTL(shouldBeRTL);
    setLocale(newLocale);
  }, []);

  // Initialize RTL on mount based on initial locale
  useEffect(() => {
    const shouldBeRTL = locale === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
      I18nManager.allowRTL(shouldBeRTL);
    }
  }, []);

  const translate = useCallback(
    (key: string, options?: TranslateOptions) => {
      const dictionary = resources[locale] ?? resources.en;
      const fallbackDictionary = resources.en;

      const localized = getNestedValue(dictionary, key);
      if (localized) {
        return interpolate(localized, options?.values);
      }

      const fallback = getNestedValue(fallbackDictionary, key);
      if (fallback) {
        return interpolate(fallback, options?.values);
      }

      if (options?.defaultValue) {
        return interpolate(options.defaultValue, options.values);
      }

      if (__DEV__) {
        console.warn(`Missing translation for key "${key}" in locale "${locale}".`);
      }

      return interpolate(key, options?.values);
    },
    [locale],
  );

  const value = useMemo<LocalizationContextValue>(
    () => ({
      locale,
      setLocale: handleSetLocale,
      t: translate,
      isRTL,
    }),
    [locale, handleSetLocale, translate, isRTL],
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { t } = useLocalization();
  return { t };
};

export const availableLocales: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  {value: 'ar', label: 'العربية'}
];

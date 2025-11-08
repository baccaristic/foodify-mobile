import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { I18nManager, Platform } from 'react-native';
import * as ExpoLocalization from 'expo-localization';
import { reloadAppAsync } from 'expo';
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

const initializeRTL = (locale: Locale): boolean => {
  const shouldBeRTL = locale === 'ar';
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    I18nManager.allowRTL(shouldBeRTL);
  }
  return shouldBeRTL;
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
  const initialLocale = resolveInitialLocale();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [isRTL, setIsRTL] = useState<boolean>(() => initializeRTL(initialLocale));

  const handleSetLocale = useCallback((newLocale: Locale) => {
    const shouldBeRTL = newLocale === 'ar';
    const currentIsRTL = I18nManager.isRTL;
    
    // Check if RTL direction needs to change
    const needsRTLUpdate = currentIsRTL !== shouldBeRTL;
    
    // Update RTL mode if it has changed
    if (needsRTLUpdate) {
      I18nManager.forceRTL(shouldBeRTL);
      I18nManager.allowRTL(shouldBeRTL);
      
      // Reload the app to apply RTL changes
      // This is necessary because React Native requires an app reload for RTL changes to take effect
      if (Platform.OS !== 'web') {
        // Set the locale in state first so it persists after reload
        setLocale(newLocale);
        setIsRTL(shouldBeRTL);
        
        // Trigger app reload after a short delay to ensure state is saved
        setTimeout(() => {
          reloadAppAsync('Language direction changed');
        }, 100);
      } else {
        // On web, just update the state without reload
        setIsRTL(shouldBeRTL);
        setLocale(newLocale);
      }
    } else {
      // No RTL change needed, just update locale
      setIsRTL(shouldBeRTL);
      setLocale(newLocale);
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

export type Locale = 'en' | 'fr';

export type TranslationValue = string | TranslationDictionary;

export type TranslationDictionary = {
  [key: string]: TranslationValue;
};

export type TranslationResources = Record<Locale, TranslationDictionary>;

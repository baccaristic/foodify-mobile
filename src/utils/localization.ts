import type { Locale } from '~/localization/types';

/**
 * Gets the localized name field based on the current locale
 * Falls back to the default name field if the localized version is not available
 */
export const getLocalizedName = (
  obj: {
    name: string;
    nameEn?: string;
    nameFr?: string;
    nameAr?: string;
  },
  locale: Locale
): string => {
  switch (locale) {
    case 'en':
      return obj.nameEn ?? obj.name;
    case 'fr':
      return obj.nameFr ?? obj.name;
    case 'ar':
      return obj.nameAr ?? obj.name;
    default:
      return obj.name;
  }
};

/**
 * Gets the localized description field based on the current locale
 * Falls back to the default description field if the localized version is not available
 */
export const getLocalizedDescription = (
  obj: {
    description: string;
    descriptionEn?: string;
    descriptionFr?: string;
    descriptionAr?: string;
  },
  locale: Locale
): string => {
  switch (locale) {
    case 'en':
      return obj.descriptionEn ?? obj.description;
    case 'fr':
      return obj.descriptionFr ?? obj.description;
    case 'ar':
      return obj.descriptionAr ?? obj.description;
    default:
      return obj.description;
  }
};

/**
 * Gets the localized description field with null handling
 * Falls back to the default description field if the localized version is not available
 */
export const getLocalizedDescriptionNullable = (
  obj: {
    description?: string | null;
    descriptionEn?: string | null;
    descriptionFr?: string | null;
    descriptionAr?: string | null;
  },
  locale: Locale
): string | null | undefined => {
  switch (locale) {
    case 'en':
      return obj.descriptionEn ?? obj.description;
    case 'fr':
      return obj.descriptionFr ?? obj.description;
    case 'ar':
      return obj.descriptionAr ?? obj.description;
    default:
      return obj.description;
  }
};

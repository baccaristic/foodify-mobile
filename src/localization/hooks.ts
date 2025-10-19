import { useCallback } from 'react';

import { useLocalization } from './index';

const resolveNumberLocale = (locale: string) => {
  switch (locale) {
    case 'fr':
      return 'fr-TN';
    case 'en':
    default:
      return 'en-TN';
  }
};

export const useCurrencyFormatter = () => {
  const { locale, t } = useLocalization();

  return useCallback(
    (value: number) => {
      const normalized = Number.isFinite(value) ? value : 0;
      const formatter = new Intl.NumberFormat(resolveNumberLocale(locale), {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
      const amount = formatter.format(normalized);

      return t('common.currency', { values: { amount } });
    },
    [locale, t],
  );
};

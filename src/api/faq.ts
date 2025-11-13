import client from './client';
import type { FaqSection } from '~/interfaces/Faq';
import type { Locale } from '~/localization/types';

const sortByPosition = <T extends { position: number }>(items: T[] = []) =>
  [...items].sort((a, b) => a.position - b.position);

export const getFaqSections = async (locale: Locale) => {
  const { data } = await client.get<FaqSection[]>('/client/faq', {
    params: { lang: locale },
  });

  if (!Array.isArray(data)) {
    return [];
  }

  return sortByPosition(data).map((section) => ({
    ...section,
    items: sortByPosition(section.items ?? []),
  }));
};


import { getLocale, type Locale } from "./locale";
import { translations, type TranslationKey } from "./translations";

export const t = (key: TranslationKey, locale?: Locale) => {
  const resolved = locale ?? getLocale();
  return translations[resolved][key] ?? translations.ko[key] ?? key;
};

export type { TranslationKey };

export const format = (
  template: string,
  params: Record<string, string | number>
) =>
  Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  );

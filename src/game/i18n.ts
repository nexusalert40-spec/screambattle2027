import translations from "./translations.json";

export const LANGUAGES = [
  { id: "ar", label: "العربية", dir: "rtl" },
  { id: "en", label: "English", dir: "ltr" },
  { id: "ru", label: "Русский", dir: "ltr" },
  { id: "zh", label: "中文", dir: "ltr" },
  { id: "tr", label: "Türkçe", dir: "ltr" },
  { id: "es", label: "Español", dir: "ltr" },
  { id: "ms", label: "Bahasa Melayu", dir: "ltr" },
  { id: "ur", label: "اردو", dir: "rtl" },
] as const;
export type Lang = typeof LANGUAGES[number]["id"];
export function isLang(value: unknown): value is Lang { return LANGUAGES.some((l) => l.id === value); }
export const STRINGS = translations;
export type StrKey = keyof typeof translations.en;

import { useEffect, useState } from "react";
import text from "./siteText.json";
import { isLang, LANGUAGES, type Lang } from "./i18n";

export type SiteKey = keyof typeof text.en;
const KEY = "scream-battle-v1";

function readLang(): Lang {
  try {
    const l = JSON.parse(localStorage.getItem(KEY) ?? "{}").lang;
    if (isLang(l)) return l;
  } catch {}
  return "en";
}

/** Same saved language as the game, so every page shows one language only. */
export function useSiteText() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const sync = () => setLang(readLang());
    sync();
    window.addEventListener("sb-lang", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("sb-lang", sync); window.removeEventListener("storage", sync); };
  }, []);
  const dir = LANGUAGES.find((l) => l.id === lang)?.dir ?? "ltr";
  const t = (k: SiteKey) => (text as Record<Lang, Record<SiteKey, string>>)[lang][k] ?? text.en[k];
  return { lang, dir, t };
}

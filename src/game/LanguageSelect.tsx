import { Globe } from "lucide-react";
import { LANGUAGES, isLang } from "./i18n";
import { useGame } from "./store";

export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const g = useGame();
  return (
    <label className={`flex min-w-0 items-center gap-2 ${compact ? "btn-game bg-card px-2 py-2" : "w-full"}`}>
      {compact && <Globe className="size-4 shrink-0" />}
      <select aria-label={g.t("language")} value={g.lang} onChange={(e) => { if (isLang(e.target.value)) g.set({ lang: e.target.value }); }} className={`min-w-0 bg-card font-bold text-ink ${compact ? "max-w-24 text-xs" : "w-full rounded-lg border-2 p-2 text-sm"}`}>
        {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
      </select>
    </label>
  );
}
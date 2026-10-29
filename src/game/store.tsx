import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { STRINGS, type Lang, type StrKey } from "./i18n";
import type { MicStatus } from "./mic";

export type MeterStyle = "rpm" | "rocket" | "tmotor" | "digital";

interface Settings {
  lang: Lang;
  sound: boolean;
  meter: MeterStyle;
  charId: string;
  entitlements: string[];
  best: { practice: number; single: number; local: number };
}
const DEFAULTS: Settings = {
  lang: "en",
  sound: true,
  meter: "rpm",
  charId: "ali",
  entitlements: [],
  best: { practice: 0, single: 0, local: 0 },
};
const KEY = "scream-battle-v1";

interface Ctx extends Settings {
  set: (p: Partial<Settings>) => void;
  recordBest: (mode: keyof Settings["best"], score: number) => void;
  t: (k: StrKey) => string;
  mic: MicStatus;
  setMic: (m: MicStatus) => void;
}
const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [mic, setMic] = useState<MicStatus>("unknown");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        // Entitlements are never trusted from local storage; they must come from a verified store.
        setS({ ...DEFAULTS, ...parsed, entitlements: [], best: { ...DEFAULTS.best, ...parsed.best } });
      }
    } catch {}
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((p) => setMic(p.state === "granted" ? "granted" : p.state === "denied" ? "denied" : "unknown"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.lang = s.lang;
    document.documentElement.dir = s.lang === "ar" ? "rtl" : "ltr";
  }, [s.lang]);

  const persist = (n: Settings) => {
    try {
      const { entitlements: _e, ...rest } = n;
      localStorage.setItem(KEY, JSON.stringify(rest));
    } catch {}
  };
  const set = useCallback((p: Partial<Settings>) => setS((o) => { const n = { ...o, ...p }; persist(n); return n; }), []);
  const recordBest = useCallback((mode: keyof Settings["best"], score: number) =>
    setS((o) => { if (score <= o.best[mode]) return o; const n = { ...o, best: { ...o.best, [mode]: score } }; persist(n); return n; }), []);
  const t = useCallback((k: StrKey) => STRINGS[s.lang][k], [s.lang]);

  return <GameCtx.Provider value={{ ...s, set, recordBest, t, mic, setMic }}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const c = useContext(GameCtx);
  if (!c) throw new Error("useGame outside provider");
  return c;
}

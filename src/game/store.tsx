import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { STRINGS, isLang, type Lang, type StrKey } from "./i18n";
import type { MicStatus } from "./mic";
import { BattleMusic, shouldPlayMusic } from "./music";
import { FREE_METER, isMeterId, isMeterOwned, type MeterId } from "./catalog";
import { supabase } from "@/integrations/supabase/client";

export type MeterStyle = MeterId;

interface Settings {
  lang: Lang;
  sound: boolean;
  music: boolean;
  meter: MeterStyle;
  charId: string;
  gender: "boy" | "girl" | null;
  roomId: string;
  entitlements: string[];
  best: { practice: number; single: number; local: number };
}
const DEFAULTS: Settings = {
  lang: "en",
  sound: true,
  music: true,
  meter: FREE_METER,
  charId: "ali",
  gender: null,
  roomId: "ali",
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
  setMeasuring: (on: boolean) => void;
  /** Signed-in account (only needed for purchases). */
  user: { id: string; email: string | null } | null;
  refreshEntitlements: () => Promise<void>;
}
// Kept on globalThis so hot reloads of this file reuse one context instead of orphaning consumers.
const g = globalThis as { __screamCtx?: React.Context<Ctx | null> };
const GameCtx = (g.__screamCtx ??= createContext<Ctx | null>(null));

export function GameProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [mic, setMic] = useState<MicStatus>("unknown");
  const [measuring, setMeasuring] = useState(false);
  const [visible, setVisible] = useState(true);
  const [musicPlayer] = useState(() => new BattleMusic());
  const [user, setUser] = useState<Ctx["user"]>(null);
  // Entitlements come only from verified purchase rows in the backend.
  const refreshEntitlements = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setS((o) => ({ ...o, entitlements: [] })); return; }
    const { data } = await supabase.from("purchases").select("product_id");
    setS((o) => ({ ...o, entitlements: [...new Set((data ?? []).map((r) => r.product_id))] }));
  }, []);
  useEffect(() => {
    const apply = (session: { user: { id: string; email?: string | null } } | null) =>
      setUser(session ? { id: session.user.id, email: session.user.email ?? null } : null);
    void supabase.auth.getSession().then(({ data }) => { apply(data.session); if (data.session) void refreshEntitlements(); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      apply(session);
      void refreshEntitlements();
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshEntitlements]);

  useEffect(() => {
    const unlock = () => { void musicPlayer.unlock().catch(() => {}); };
    const visibility = () => setVisible(!document.hidden);
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", visibility);
      musicPlayer.close();
    };
  }, [musicPlayer]);
  useEffect(() => musicPlayer.setPlaying(shouldPlayMusic(s.music, measuring, visible)), [s.music, measuring, visible, musicPlayer]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        // Entitlements are never trusted from local storage; they must come from a verified store.
        setS({ ...DEFAULTS, ...parsed, lang: isLang(parsed.lang) ? parsed.lang : DEFAULTS.lang, music: typeof parsed.music === "boolean" ? parsed.music : DEFAULTS.music, meter: isMeterId(parsed.meter) ? parsed.meter : FREE_METER, gender: parsed.gender === "boy" || parsed.gender === "girl" ? parsed.gender : null, entitlements: [], best: { ...DEFAULTS.best, ...parsed.best } });
      }
    } catch {}
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((p) => setMic(p.state === "granted" ? "granted" : p.state === "denied" ? "denied" : "unknown"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.lang = s.lang;
    document.documentElement.dir = s.lang === "ar" || s.lang === "ur" ? "rtl" : "ltr";
  }, [s.lang]);

  const persist = (n: Settings) => {
    try {
      const { entitlements: _e, ...rest } = n;
      localStorage.setItem(KEY, JSON.stringify(rest));
      window.dispatchEvent(new Event("sb-lang"));
    } catch {}
  };
  const set = useCallback((p: Partial<Settings>) => setS((o) => { const n = { ...o, ...p }; persist(n); return n; }), []);
  const recordBest = useCallback((mode: keyof Settings["best"], score: number) =>
    setS((o) => { if (score <= o.best[mode]) return o; const n = { ...o, best: { ...o.best, [mode]: score } }; persist(n); return n; }), []);
  const t = useCallback((k: StrKey) => STRINGS[s.lang][k], [s.lang]);

  return <GameCtx.Provider value={{ ...s, meter: isMeterOwned(s.meter, s.entitlements) ? s.meter : FREE_METER, set, recordBest, t, mic, setMic, setMeasuring, user, refreshEntitlements }}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const c = useContext(GameCtx);
  if (!c) throw new Error("useGame outside provider");
  return c;
}

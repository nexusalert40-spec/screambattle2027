import { useEffect, useState } from "react";
import { Lock, Mic, MicOff, Settings as Cog, ShoppingBag, Trophy, Users, Globe, Gauge, Volume2, VolumeX, Zap, Dumbbell, Bot, Check, Crown } from "lucide-react";
import { GameProvider, useGame, type MeterStyle } from "./store";
import { CHARACTERS, getChar, isOwned, characterName, type Character } from "./characters";
import { LanguageSelect } from "./LanguageSelect";
import { Avatar, CharTile, GameButton, Screen, Waves } from "./ui";
import { Round } from "./Round";
import { Meter } from "./Meters";
import { MicAnalyzer, type RoundResult } from "./mic";
import { aiOpponentScore, decideWinner, type Difficulty } from "./scoring";
import { sfx } from "./sfx";
import { setupServiceWorker, useInstall } from "./pwa";
import { Download, Apple, Play } from "lucide-react";

type View = "splash" | "menu" | "chars" | "meters" | "single" | "local" | "practice" | "online" | "leader" | "shop" | "settings";

export function ScreamBattle() {
  return <GameProvider><Shell /></GameProvider>;
}

function Shell() {
  const [view, setView] = useState<View>("splash");
  useEffect(() => { void setupServiceWorker(); }, []);
  const go = (v: View) => setView(v);
  const home = () => go("menu");
  switch (view) {
    case "splash": return <Splash onDone={home} />;
    case "menu": return <Menu go={go} />;
    case "chars": return <CharSelect onBack={home} />;
    case "meters": return <MeterSelect onBack={home} />;
    case "single": return <Single onBack={home} />;
    case "local": return <Local onBack={home} />;
    case "practice": return <Practice onBack={home} />;
    case "online": return <Info view="online" onBack={home} />;
    case "leader": return <Info view="leader" onBack={home} />;
    case "shop": return <Shop onBack={home} />;
    case "settings": return <SettingsScreen onBack={home} />;
  }
}

/* ---------- Splash (animated fallback; no video asset configured) ---------- */
function Splash({ onDone }: { onDone: () => void }) {
  const { t } = useGame();
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const ts = [setTimeout(() => setStage(1), 900), setTimeout(() => setStage(2), 1900), setTimeout(onDone, 4200)];
    return () => ts.forEach(clearTimeout);
  }, [onDone]);
  const ali = getChar("ali"), aicha = getChar("aicha");
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden">
      <div className="flex w-full max-w-lg items-end justify-between px-2">
        <div className="anim-slide-l relative"><Waves color="var(--ali)" /><Avatar c={ali} size={170} shouting={stage >= 1} anim={stage >= 1 ? "anim-shake" : ""} /></div>
        <div className="anim-slide-r relative"><Waves color="var(--aicha)" /><Avatar c={aicha} size={170} shouting={stage >= 1} anim={stage >= 1 ? "anim-shake" : ""} flip /></div>
      </div>
      {stage >= 1 && <div className="anim-popin bg-vs title-white -mt-6 grid size-24 place-items-center rounded-full border-4 border-ink text-5xl">VS</div>}
      {stage >= 2 && (
        <div className="anim-popin mt-4 text-center">
          <h1 className="title-pop text-6xl leading-none">SCREAM<br />BATTLE</h1>
          <p className="title-white mt-2 text-xl">{t("tagline")}</p>
        </div>
      )}
      <GameButton tone="ali" onClick={onDone} className="absolute end-4 top-4 text-base">{t("skip")}</GameButton>
    </div>
  );
}

/* ---------- Menu ---------- */
function Menu({ go }: { go: (v: View) => void }) {
  const g = useGame();
  const { t } = g;
  const me = getChar(g.charId);
  const rival = me.id === "aicha" ? getChar("ali") : getChar("aicha");
  const micIcon = g.mic === "granted" ? <Mic className="size-4" /> : <MicOff className="size-4" />;
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-6 pt-4">
      <div className="grid grid-cols-2 items-center gap-2 text-sm font-bold">
        <span className="card-game flex items-center gap-2 px-3 py-1.5"><img src={me.image} alt="" className="size-6" /> {t("guest")}</span>
        <span className={`card-game flex items-center gap-1 px-3 py-1.5 ${g.mic === "granted" ? "text-ali" : g.mic === "denied" ? "text-destructive" : "text-muted-foreground"}`}>
          {micIcon}{g.mic === "granted" ? t("micOk") : g.mic === "denied" ? t("micNo") : t("micUnknown")}
        </span>
        <div className="col-span-2 flex justify-end gap-2">
          <button aria-label={t("sound")} onClick={() => g.set({ sound: !g.sound })} className="btn-game bg-card grid size-10 place-items-center rounded-full">{g.sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}</button>
          <LanguageSelect compact />
        </div>
      </div>

      <div className="mt-6 text-center">
        <h1 className="title-pop text-6xl leading-[0.9]">SCREAM<br />BATTLE</h1>
        <p className="title-white mt-2 text-lg">{t("tagline")}</p>
      </div>

      <div className="relative mt-2 flex items-end justify-center">
        <Avatar c={me} size={150} />
        <div className="bg-vs title-white z-10 -mx-4 mb-10 grid size-14 place-items-center rounded-full border-4 border-ink text-2xl">VS</div>
        <Avatar c={rival} size={150} flip />
      </div>

      <GameButton onClick={() => go("single")} className="mt-2 w-full py-5 text-5xl">{t("play")}</GameButton>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <GameButton tone="aicha" onClick={() => go("local")} className="flex items-center justify-center gap-2"><Users className="size-5" />{t("local")}</GameButton>
        <GameButton tone="ali" onClick={() => go("single")} className="flex items-center justify-center gap-2"><Zap className="size-5" />{t("quick")}</GameButton>
        <GameButton tone="turq" onClick={() => go("practice")} className="flex items-center justify-center gap-2"><Dumbbell className="size-5" />{t("practice")}</GameButton>
        <GameButton tone="grape" onClick={() => go("online")} className="flex items-center justify-center gap-2"><Globe className="size-5" />{t("online")}</GameButton>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {([["chars", Crown, t("characters")], ["meters", Gauge, t("meters")], ["leader", Trophy, t("leaderboard")], ["shop", ShoppingBag, t("shop")], ["settings", Cog, t("settings")]] as const).map(([v, I, l]) => (
          <button key={v} onClick={() => { sfx.tap(g.sound); go(v); }} className="flex flex-col items-center gap-1">
            <span className="btn-game bg-card grid size-14 place-items-center rounded-2xl"><I className="size-6 text-ink" /></span>
            <span className="title-white w-full break-words text-center text-[10px] leading-tight">{l}</span>
          </button>
        ))}
      </div>
      <DownloadApp />
    </div>
  );
}

/* ---------- Download App (hidden inside the native apps) ---------- */
function DownloadApp() {
  const { t } = useGame();
  const ins = useInstall();
  if (ins.native) return null;
  // Store listings don't exist yet, so the store badges stay disabled until real URLs are added.
  const badge = (Icon: typeof Apple, pre: string, name: string) => (
    <button disabled aria-disabled className="btn-game flex items-center gap-2 bg-ink px-3 py-2 text-start text-card" title={t("comingSoon")}>
      <Icon className="size-7 shrink-0" />
      <span className="flex flex-col leading-none"><span className="font-sans text-[10px] font-bold">{pre}</span><span className="text-lg">{name}</span></span>
    </button>
  );
  return (
    <section aria-labelledby="get-app" className="card-game mt-6 p-4 text-center">
      <h2 id="get-app" className="font-display text-2xl">{t("getApp")}</h2>
      <p className="text-sm font-bold text-muted-foreground">{t("getAppBody")}</p>
      {!ins.standalone && (ins.canPrompt
        ? <GameButton onClick={() => void ins.prompt()} className="mt-3 inline-flex w-full items-center justify-center gap-2"><Download className="size-5" />{t("installApp")}</GameButton>
        : ins.ios && <p className="mt-3 rounded-2xl bg-muted p-2 text-sm font-bold">{t("iosInstallHint")}</p>)}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {badge(Apple, t("appStorePre"), t("appStore"))}
        {badge(Play, t("playPre"), t("googlePlay"))}
      </div>
      <p className="mt-2 text-xs font-bold text-muted-foreground">{t("comingSoon")}</p>
    </section>
  );
}

/* ---------- Characters ---------- */
function CharSelect({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const { t } = g;
  const [preview, setPreview] = useState<Character>(getChar(g.charId));
  const owned = isOwned(preview, g.entitlements);
  return (
    <Screen title={t("chooseChar")} onBack={onBack}>
      <CharTile c={preview}>
        <div className="flex flex-col items-center py-4">
          <Avatar c={preview} size={190} />
          <p className="title-white mt-1 text-3xl">{characterName(preview, g.lang)}</p>
        </div>
      </CharTile>
      <div className="my-4">
        {owned ? (
          <GameButton className="w-full" disabled={g.charId === preview.id} onClick={() => g.set({ charId: preview.id })}>
            {g.charId === preview.id ? t("selected") : t("select")}
          </GameButton>
        ) : (
          <div className="card-game flex items-center gap-3 p-3 text-sm font-semibold"><Lock className="size-6 shrink-0" />{t("shopNote")}</div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {CHARACTERS.map((c) => {
          const own = isOwned(c, g.entitlements);
          return (
            <button key={c.id} onClick={() => setPreview(c)} className={`text-start ${preview.id === c.id ? "scale-105" : ""} transition-transform`}>
              <CharTile c={c}>
                <img src={c.image} alt={c.name.en} loading="lazy" className={`aspect-square w-full object-contain p-1 ${own ? "" : "opacity-60 grayscale-[0.5]"}`} />
                <span className="absolute end-1 top-1 rounded-full border-2 border-ink bg-card px-2 text-[10px] font-black">
                  {c.tier === "free" ? t("free") : own ? t("owned") : t("premium")}
                </span>
                {!own && <Lock className="absolute bottom-8 end-2 size-5 text-card" />}
                <p className="title-white truncate px-1 pb-1 text-center text-sm">{characterName(c, g.lang)}</p>
              </CharTile>
            </button>
          );
        })}
      </div>
    </Screen>
  );
}

/* ---------- Meters ---------- */
const METERS: MeterStyle[] = ["rpm", "rocket", "tmotor", "digital"];
function MeterSelect({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [demo, setDemo] = useState(0);
  useEffect(() => { const i = setInterval(() => setDemo((d) => (d + 7) % 100), 120); return () => clearInterval(i); }, []);
  return (
    <Screen title={g.t("chooseMeter")} onBack={onBack}>
      <div className="grid grid-cols-2 gap-3">
        {METERS.map((m) => (
          <button key={m} onClick={() => g.set({ meter: m })} className={`card-game relative p-2 ${g.meter === m ? "ring-4 ring-sun" : ""}`}>
            <Meter style={m} value={demo} peak={80} />
            <p className="font-display mt-1 text-lg">{g.t(m)}</p>
            {g.meter === m && <Check className="absolute end-2 top-2 size-6 rounded-full bg-sun p-1" strokeWidth={4} />}
          </button>
        ))}
      </div>
    </Screen>
  );
}

/* ---------- Results ---------- */
function Results({ a, b, aName, bName, aChar, bChar, onRematch, onMenu }: { a: number; b: number; aName: string; bName: string; aChar: Character; bChar: Character; onRematch: () => void; onMenu: () => void }) {
  const g = useGame();
  const w = decideWinner(a, b);
  useEffect(() => { w === "b" && bName === g.t("aiLabel") ? sfx.lose(g.sound) : sfx.win(g.sound); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const col = (name: string, score: number, c: Character, win: boolean, flip?: boolean) => (
    <div className="flex flex-1 flex-col items-center">
      <Avatar c={c} size={130} anim={w === "tie" ? "anim-bob" : win ? "anim-dance" : "anim-slump"} flip={flip} />
      <p className="title-white text-xl">{name}</p>
      <p className={`title-pop text-6xl ${win ? "" : "opacity-70"}`}>{score}</p>
    </div>
  );
  return (
    <div className="flex flex-1 flex-col items-center gap-4">
      <h2 className="anim-popin title-pop text-center text-5xl">{w === "tie" ? g.t("tie") : `${w === "a" ? aName : bName} ${g.t("wins")}`}</h2>
      <div className="flex w-full items-end">{col(aName, a, aChar, w === "a")}{col(bName, b, bChar, w === "b", true)}</div>
      <div className="grid w-full grid-cols-2 gap-3">
        <GameButton onClick={onRematch}>{g.t("rematch")}</GameButton>
        <GameButton tone="ali" onClick={onMenu}>{g.t("menu")}</GameButton>
      </div>
    </div>
  );
}

function NoScream({ onRetry }: { onRetry: () => void }) {
  const { t } = useGame();
  return (
    <div className="card-game p-5 text-center">
      <p className="mb-4 text-lg font-bold">{t("noScream")}</p>
      <GameButton onClick={onRetry}>{t("tryAgain")}</GameButton>
    </div>
  );
}

/* ---------- Single player vs AI ---------- */
function Single({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const { t } = g;
  const [diff, setDiff] = useState<Difficulty | null>(null);
  const [res, setRes] = useState<RoundResult | null>(null);
  const [ai, setAi] = useState(0);
  const [key, setKey] = useState(0);
  const me = getChar(g.charId);
  const opp = getChar(me.id === "robo" ? "ali" : "robo");
  const finish = (r: RoundResult) => { if (!diff) return; setRes(r); setAi(aiOpponentScore(diff)); if (r.valid) g.recordBest("single", r.peak); };
  const again = () => { setRes(null); setKey((k) => k + 1); };
  return (
    <Screen title={t("vsAI")} onBack={onBack}>
      {!diff ? (
        <div className="flex flex-col gap-3">
          <div className="card-game flex items-center gap-3 p-3"><Bot className="size-8 shrink-0 text-ali" /><p className="text-sm font-semibold">{t("aiNote")}</p></div>
          <p className="title-white mt-2 text-center text-2xl">{t("difficulty")}</p>
          <GameButton tone="turq" onClick={() => setDiff("easy")}>{t("easy")}</GameButton>
          <GameButton onClick={() => setDiff("normal")}>{t("normal")}</GameButton>
          <GameButton tone="aicha" onClick={() => setDiff("hard")}>{t("hard")}</GameButton>
        </div>
      ) : !res ? (
        <Round key={key} label={`${t("you")} — ${t("getReady")}`} char={me} onDone={finish} />
      ) : !res.valid ? (
        <NoScream onRetry={again} />
      ) : (
        <Results a={res.peak} b={ai} aName={t("you")} bName={`${characterName(opp, g.lang)} (${t("aiLabel")})`} aChar={me} bChar={opp} onRematch={again} onMenu={onBack} />
      )}
    </Screen>
  );
}

/* ---------- Local 2 players (same mic, turns) ---------- */
function Local({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const { t } = g;
  const [turn, setTurn] = useState<1 | 2 | 3>(1);
  const [scores, setScores] = useState<[RoundResult | null, RoundResult | null]>([null, null]);
  const [pending, setPending] = useState(false);
  const [key, setKey] = useState(0);
  const p1 = getChar(g.charId);
  const p2 = getChar(p1.id === "aicha" ? "ali" : "aicha");
  const reset = () => { setTurn(1); setScores([null, null]); setPending(false); setKey((k) => k + 1); };
  const name = (n: number) => `${t("player")} ${n}`;

  const done = (r: RoundResult) => {
    if (!r.valid) { setScores((s) => (turn === 1 ? [r, s[1]] : [s[0], r])); setPending(true); return; }
    g.recordBest("local", r.peak);
    if (turn === 1) { setScores([r, null]); setTurn(2); setPending(true); }
    else { setScores((s) => [s[0], r]); setTurn(3); }
  };
  const current = turn === 3 ? null : scores[turn - 1];

  return (
    <Screen title={t("local")} onBack={onBack}>
      {turn === 3 && scores[0] && scores[1] ? (
        <Results a={scores[0].peak} b={scores[1].peak} aName={name(1)} bName={name(2)} aChar={p1} bChar={p2} onRematch={reset} onMenu={onBack} />
      ) : pending ? (
        current && !current.valid ? (
          <NoScream onRetry={() => { setPending(false); setKey((k) => k + 1); }} />
        ) : (
          <div className="flex flex-1 flex-col items-center gap-4 text-center">
            <p className="title-white text-2xl">{name(1)}: {scores[0]?.peak}</p>
            <Avatar c={p2} size={170} />
            <p className="title-pop text-4xl">{name(2)} — {t("getReady")}</p>
            <p className="card-game px-4 py-2 text-sm font-semibold">{t("sameMic")}</p>
            <GameButton tone="aicha" className="w-full max-w-xs" onClick={() => { setPending(false); setKey((k) => k + 1); }}>{t("start")}</GameButton>
          </div>
        )
      ) : (
        <Round key={key} label={`${name(turn)} — ${t("getReady")}`} char={turn === 1 ? p1 : p2} onDone={done} autoStart={turn === 2 || key > 0} />
      )}
    </Screen>
  );
}

/* ---------- Practice (free live meter) ---------- */
function Practice({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [key, setKey] = useState(0);
  const [last, setLast] = useState<RoundResult | null>(null);
  const me = getChar(g.charId);
  return (
    <Screen title={g.t("practiceTitle")} onBack={onBack}>
      <p className="title-white mb-2 text-center text-lg">{g.t("best")}: {g.best.practice}</p>
      {last ? (
        <div className="flex flex-col items-center gap-4">
          {last.valid ? <><Meter style={g.meter} value={last.peak} peak={last.peak} /><p className="title-pop text-5xl">{g.t("peak")} {last.peak}</p></> : <p className="card-game p-4 font-bold">{g.t("noScream")}</p>}
          <GameButton className="w-full" onClick={() => { setLast(null); setKey((k) => k + 1); }}>{g.t("tryAgain")}</GameButton>
        </div>
      ) : (
        <Round key={key} label={g.t("getReady")} char={me} autoStart={key > 0} onDone={(r) => { setLast(r); if (r.valid) g.recordBest("practice", r.peak); }} />
      )}
    </Screen>
  );
}

/* ---------- Online / Leaderboard (honest setup states) ---------- */
function Info({ view, onBack }: { view: "online" | "leader"; onBack: () => void }) {
  const g = useGame();
  const { t } = g;
  return (
    <Screen title={view === "online" ? t("online") : t("leaderboard")} onBack={onBack}>
      <div className="card-game p-5 text-center">
        <span className="mb-3 inline-block rounded-full bg-sun px-3 py-1 font-display">{t("needsBackend")}</span>
        <p className="font-semibold">{view === "online" ? t("onlineNote") : t("leaderNote")}</p>
      </div>
      {view === "leader" && (
        <div className="card-game mt-4 p-5">
          <p className="font-display mb-3 text-xl">{t("localBest")}</p>
          {([["practice", t("practice")], ["single", t("vsAI")], ["local", t("local")]] as const).map(([k, l]) => (
            <div key={k} className="flex justify-between border-b-2 py-2 font-bold last:border-0"><span>{l}</span><span className="font-display text-xl">{g.best[k] || "—"}</span></div>
          ))}
        </div>
      )}
    </Screen>
  );
}

/* ---------- Shop (preview only — purchases disabled until seller verification) ---------- */
function Shop({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const premium = CHARACTERS.filter((c) => c.tier === "premium");
  const products = [
    { id: "premium-characters", name: g.t("packChars"), desc: g.t("packCharsDesc"), price: "$0.99", icon: Crown, tone: "bg-grape-grad" },
    { id: "scream-effects", name: g.t("packFx"), desc: g.t("packFxDesc"), price: "$0.99", icon: Volume2, tone: "bg-aicha-grad" },
    { id: "advanced-meters", name: g.t("packMeters"), desc: g.t("packMetersDesc"), price: "$1.99", icon: Gauge, tone: "bg-turq-grad" },
  ] as const;
  return (
    <Screen title={g.t("shop")} onBack={onBack}>
      <div className="card-game mb-4 flex items-center gap-3 p-3 text-sm font-semibold"><Lock className="size-6 shrink-0" />{g.t("buyDisabled")}</div>
      <div className="flex flex-col gap-3">
        {products.map((p) => (
          <div key={p.id} className="card-game flex items-center gap-3 p-3">
            <span className={`btn-game ${p.tone} grid size-14 shrink-0 place-items-center rounded-2xl`}><p.icon className="size-7 text-ink" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg leading-tight">{p.name}</p>
              <p className="text-xs font-semibold text-muted-foreground">{p.desc}</p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <span className="rounded-full border-2 border-ink bg-sun px-2 py-0.5 font-display text-sm">{p.price}</span>
              <button disabled aria-disabled className="btn-game bg-card cursor-not-allowed px-3 py-1 text-xs opacity-60">{g.t("needsBackend")}</button>
            </div>
          </div>
        ))}
      </div>
      <p className="title-white mt-5 text-center text-xl">{g.t("packChars")}</p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {premium.map((c) => (
          <CharTile key={c.id} c={c}>
            <img src={c.image} alt={c.name.en} loading="lazy" className="aspect-square w-full object-contain p-2" />
            <p className="title-white truncate px-1 pb-1 text-center text-sm">{characterName(c, g.lang)}</p>
          </CharTile>
        ))}
      </div>
    </Screen>
  );
}

/* ---------- Settings ---------- */
function SettingsScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const { t } = g;
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 py-3 last:border-0"><span className="font-bold">{label}</span><div className="flex gap-2">{children}</div></div>
  );
  const Pill = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <GameButton tone={on ? "sun" : "ali"} onClick={onClick} className="min-w-0 break-words px-2 py-1.5 text-sm">{children}</GameButton>
  );
  return (
    <Screen title={t("settings")} onBack={onBack}>
      <div className="card-game px-4">
        <div className="border-b-2 py-3"><p className="mb-2 font-bold">{t("language")}</p><LanguageSelect /></div>
        <Row label={t("sound")}><Pill on={g.sound} onClick={() => g.set({ sound: true })}>{t("on")}</Pill><Pill on={!g.sound} onClick={() => g.set({ sound: false })}>{t("off")}</Pill></Row>
        <Row label={t("music")}><Pill on={g.music} onClick={() => g.set({ music: true })}>{t("on")}</Pill><Pill on={!g.music} onClick={() => g.set({ music: false })}>{t("off")}</Pill></Row>
        <div className="border-b-2 py-3">
          <p className="mb-2 font-bold">{t("meterStyle")}</p>
          <div className="grid grid-cols-2 gap-2">{METERS.map((m) => <Pill key={m} on={g.meter === m} onClick={() => g.set({ meter: m })}>{t(m)}</Pill>)}</div>
        </div>
        <p className="py-3 text-sm text-muted-foreground">{t("privacy")}</p>
      </div>
      {!MicAnalyzer.supported() && <p className="card-game mt-4 p-3 font-bold">{t("micUnsupported")}</p>}
    </Screen>
  );
}

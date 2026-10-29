import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { MicAnalyzer, type RoundResult } from "./mic";
import { useGame } from "./store";
import { Meter } from "./Meters";
import { sfx } from "./sfx";
import { Avatar, GameButton, Waves } from "./ui";
import type { Character } from "./characters";

type Phase = "permission" | "ready" | "calibrate" | "count" | "scream" | "done" | "error";

/** One full player turn: mic permission → calibration → 3,2,1 → 5 s capture. */
export function Round({ label, char, onDone, autoStart }: { label: string; char: Character; onDone: (r: RoundResult) => void; autoStart?: boolean | undefined }) {
  const g = useGame();
  const { t } = g;
  const [phase, setPhase] = useState<Phase>(g.mic === "granted" ? "ready" : "permission");
  const [count, setCount] = useState(3);
  const [live, setLive] = useState(0);
  const [peak, setPeak] = useState(0);
  const [left, setLeft] = useState(5000);
  const [err, setErr] = useState("");
  const mic = useRef<MicAnalyzer | null>(null);
  const alive = useRef(true);

  useEffect(() => { alive.current = true; return () => { alive.current = false; mic.current?.close(); g.setMeasuring(false); }; }, []);
  // Release the microphone if the app is backgrounded mid-round (native apps and mobile browsers).
  useEffect(() => {
    const onHide = () => {
      if (!document.hidden || !mic.current) return;
      mic.current.close(); mic.current = null; g.setMeasuring(false);
      setErr(t("tryAgain")); setPhase("error");
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [g, t]);
  useEffect(() => { if (autoStart && phase === "ready") start(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function start() {
    g.setMeasuring(true);
    if (!MicAnalyzer.supported()) { g.setMeasuring(false); g.setMic("unsupported"); setErr(t("micUnsupported")); setPhase("error"); return; }
    const m = new MicAnalyzer();
    try { await m.open(); } catch { m.close(); g.setMeasuring(false); g.setMic("denied"); setErr(t("micDenied")); setPhase("error"); return; }
    if (!alive.current) { m.close(); return; }
    g.setMic("granted");
    mic.current = m;
    setPhase("calibrate");
    const baseline = await m.calibrate();
    const still = () => alive.current && mic.current === m;
    for (const n of [3, 2, 1]) {
      if (!still()) return;
      setPhase("count"); setCount(n); sfx.tick(g.sound);
      await new Promise((r) => setTimeout(r, 900));
    }
    if (!still()) return;
    setPhase("scream");
    const res = await m.runRound(baseline, (l, p, ms) => { setLive(l); setPeak(p); setLeft(ms); });
    if (!still()) return;
    m.close(); mic.current = null;
    g.setMeasuring(false);
    if (!alive.current) return;
    setPhase("done");
    setTimeout(() => alive.current && onDone(res), 900);
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-4 text-center">
      <p className="title-pop text-3xl">{label}</p>
      <div className="relative">
        {phase === "scream" && <Waves />}
        <Avatar c={char} size={150} shouting={phase === "scream" && live > 20} anim={phase === "scream" ? (live > 50 ? "anim-shake" : "") : "anim-bob"} />
      </div>

      {phase === "permission" && (
        <div className="card-game p-5">
          <Mic className="mx-auto mb-2 size-10 text-ali" />
          <p className="mb-4 font-semibold">{t("micExplain")}</p>
          <GameButton tone="ali" onClick={start} className="w-full">{t("allowMic")}</GameButton>
        </div>
      )}
      {phase === "ready" && <GameButton onClick={start} className="w-full max-w-xs text-3xl">{t("start")}</GameButton>}
      {phase === "calibrate" && <div className="card-game px-5 py-4 font-bold">{t("quiet")}</div>}
      {phase === "count" && <div key={count} className="anim-popin title-pop text-9xl">{count}</div>}
      {(phase === "scream" || phase === "done") && (
        <>
          <div className="anim-popin title-white text-5xl">{phase === "scream" ? t("scream") : `${t("peak")} ${peak}`}</div>
          <Meter style={g.meter} value={phase === "done" ? peak : live} peak={peak} />
          <div className="h-3 w-full max-w-xs overflow-hidden rounded-full border-2 border-ink bg-card">
            <div className="h-full bg-aicha" style={{ width: `${(left / 5000) * 100}%` }} />
          </div>
        </>
      )}
      {phase === "error" && (
        <div className="card-game p-5">
          <MicOff className="mx-auto mb-2 size-10 text-destructive" />
          <p className="mb-4 font-semibold">{err}</p>
          <GameButton tone="ali" onClick={() => setPhase("permission")}>{t("tryAgain")}</GameButton>
        </div>
      )}
    </div>
  );
}

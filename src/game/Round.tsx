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

  useEffect(() => { alive.current = true; return () => { alive.current = false; mic.current?.close(); }; }, []);
  useEffect(() => { if (autoStart && phase === "ready") start(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function start() {
    if (!MicAnalyzer.supported()) { g.setMic("unsupported"); setErr(t("micUnsupported")); setPhase("error"); return; }
    const m = new MicAnalyzer();
    try { await m.open(); } catch { g.setMic("denied"); setErr(t("micDenied")); setPhase("error"); return; }
    g.setMic("granted");
    mic.current = m;
    setPhase("calibrate");
    const baseline = await m.calibrate();
    for (const n of [3, 2, 1]) {
      if (!alive.current) return;
      setPhase("count"); setCount(n); sfx.tick(g.sound);
      await new Promise((r) => setTimeout(r, 900));
    }
    if (!alive.current) return;
    setPhase("scream"); sfx.go(g.sound);
    const res = await m.runRound(baseline, (l, p, ms) => { setLive(l); setPeak(p); setLeft(ms); });
    m.close(); mic.current = null;
    if (!alive.current) return;
    setPhase("done");
    setTimeout(() => alive.current && onDone(res), 900);
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-4 text-center">
      <p className="title-pop text-3xl">{label}</p>
      <div className="relative">
        {phase === "scream" && <Waves />}
        <Avatar c={char} size={150} anim={phase === "scream" ? (live > 50 ? "anim-shake" : "") : "anim-bob"} />
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

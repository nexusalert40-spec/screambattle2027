import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useGame } from "./store";
import { sfx } from "./sfx";
import { themeBg, type Character } from "./characters";

export function GameButton({ children, onClick, tone = "sun", className = "", disabled }: { children: ReactNode; onClick?: () => void; tone?: "sun" | "ali" | "aicha" | "grape" | "turq"; className?: string; disabled?: boolean }) {
  const { sound } = useGame();
  return (
    <button disabled={disabled} onClick={() => { sfx.tap(sound); onClick?.(); }} className={`btn-game bg-${tone}-grad px-5 py-3 text-xl ${className}`}>
      {children}
    </button>
  );
}

export function Screen({ title, onBack, children }: { title: string; onBack?: () => void; children: ReactNode }) {
  const { t, lang } = useGame();
  const Arrow = lang === "ar" ? ArrowRight : ArrowLeft;
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-8 pt-4">
      <header className="mb-4 flex items-center gap-3">
        {onBack && (
          <button aria-label={t("back")} onClick={onBack} className="btn-game bg-ali-grad grid size-12 shrink-0 place-items-center rounded-full">
            <Arrow className="size-6" strokeWidth={3} />
          </button>
        )}
        <h1 className="title-white flex-1 text-center text-3xl leading-tight">{title}</h1>
        {onBack && <span className="size-12 shrink-0" />}
      </header>
      {children}
    </div>
  );
}

export function Avatar({ c, size = 140, anim = "anim-bob", flip }: { c: Character; size?: number; anim?: string; flip?: boolean | undefined }) {
  return (
    <div className={anim} style={{ width: size, height: size }}>
      <img src={c.image} alt={c.name.en} width={1024} height={1024} className="size-full object-contain drop-shadow-[0_6px_0_var(--ink)]" style={flip ? { transform: "scaleX(-1)" } : undefined} />
    </div>
  );
}

export function CharTile({ c, children }: { c: Character; children?: ReactNode }) {
  return <div className={`${themeBg[c.theme]} relative overflow-hidden rounded-3xl border-[3px] border-ink`}>{children}</div>;
}

export function Waves({ color = "var(--card)" }: { color?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      {[0, 0.5, 1].map((d) => (
        <span key={d} className="anim-wave absolute size-40 rounded-full border-4" style={{ borderColor: color, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}

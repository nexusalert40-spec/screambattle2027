import type { MeterId } from "./catalog";

interface P { value: number; peak: number }

function zoneColor(v: number) {
  return v < 40 ? "var(--turq)" : v < 70 ? "var(--sun)" : "var(--aicha)";
}

function RpmMeter({ value, peak }: P) {
  const ang = (v: number) => -120 + (v / 100) * 240;
  const arc = (from: number, to: number) => {
    const p = (v: number) => { const a = ((ang(v) - 90) * Math.PI) / 180; return [100 + 80 * Math.cos(a), 110 + 80 * Math.sin(a)]; };
    const [x1, y1] = p(from); const [x2, y2] = p(to);
    return `M${x1} ${y1} A80 80 0 ${to - from > 75 ? 1 : 0} 1 ${x2} ${y2}`;
  };
  return (
    <svg viewBox="0 0 200 210" className={`w-full ${value > 80 ? "anim-shake" : ""}`}>
      <circle cx="100" cy="110" r="96" fill="var(--card)" stroke="var(--ink)" strokeWidth="5" />
      <path d={arc(0, 40)} stroke="var(--turq)" strokeWidth="14" fill="none" />
      <path d={arc(40, 70)} stroke="var(--sun)" strokeWidth="14" fill="none" />
      <path d={arc(70, 100)} stroke="var(--aicha)" strokeWidth="14" fill="none" />
      {[0, 20, 40, 60, 80, 100].map((v) => {
        const a = ((ang(v) - 90) * Math.PI) / 180;
        return <text key={v} x={100 + 58 * Math.cos(a)} y={114 + 58 * Math.sin(a)} textAnchor="middle" fontSize="10" fill="var(--ink)" fontWeight="800">{v}</text>;
      })}
      <g transform={`rotate(${ang(peak)} 100 110)`}><polygon points="100,22 95,34 105,34" fill="var(--grape)" /></g>
      <g style={{ transition: "transform 0.08s" }} transform={`rotate(${ang(value)} 100 110)`}>
        <polygon points="97,110 100,36 103,110" fill="var(--destructive)" stroke="var(--ink)" strokeWidth="1.5" />
      </g>
      <circle cx="100" cy="110" r="10" fill="var(--ink)" />
      <text x="100" y="160" textAnchor="middle" fontSize="30" fontFamily="var(--font-display)" fill="var(--ink)">{value}</text>
    </svg>
  );
}

function RocketMeter({ value, peak }: P) {
  const y = 170 - (value / 100) * 140;
  return (
    <svg viewBox="0 0 200 200" className="w-full">
      <rect x="4" y="4" width="192" height="192" rx="24" fill="var(--sky-deep)" stroke="var(--ink)" strokeWidth="5" />
      {[...Array(8)].map((_, i) => <circle key={i} cx={20 + ((i * 47) % 170)} cy={20 + ((i * 31) % 120)} r="1.8" fill="var(--sun)" />)}
      <rect x="92" y={y + 30} width="16" height={Math.max(0, 180 - y - 30)} fill={zoneColor(value)} opacity="0.5" rx="8" />
      <line x1="40" x2="160" y1={170 - (peak / 100) * 140} y2={170 - (peak / 100) * 140} stroke="var(--sun)" strokeWidth="3" strokeDasharray="6 4" />
      <g style={{ transition: "transform 0.1s" }} transform={`translate(0 ${y - 100})`}>
        <g className={value > 10 ? "anim-flicker" : ""} style={{ transformBox: "fill-box" }}>
          <path d={`M92 140 Q100 ${150 + value / 3} 108 140 Z`} fill="var(--sun)" />
          <path d="M95 140 Q100 150 105 140 Z" fill="var(--destructive)" />
        </g>
        <path d="M100 70 C115 85 115 120 110 140 L90 140 C85 120 85 85 100 70 Z" fill="var(--card)" stroke="var(--ink)" strokeWidth="3" />
        <circle cx="100" cy="102" r="7" fill="var(--turq)" stroke="var(--ink)" strokeWidth="2" />
        <path d="M90 125 L78 142 L90 138 Z M110 125 L122 142 L110 138 Z" fill="var(--aicha)" stroke="var(--ink)" strokeWidth="2" />
      </g>
      <text x="170" y="40" textAnchor="end" fontSize="34" fontFamily="var(--font-display)" fill="var(--card)" stroke="var(--ink)" strokeWidth="1">{value}</text>
    </svg>
  );
}

type Theme = { bg: string; low: string; high: string; bar: string; wave?: boolean; shake?: boolean };
const THEMES: Record<Exclude<MeterId, "classic" | "rocket">, Theme> = {
  fire: { bg: "linear-gradient(180deg, var(--ink), var(--destructive))", low: "🕯️", high: "🔥", bar: "linear-gradient(90deg, var(--sun), var(--destructive))" },
  glass: { bg: "linear-gradient(180deg, var(--sky-deep), var(--turq))", low: "🥛", high: "💥", bar: "linear-gradient(90deg, var(--card), var(--turq))", shake: true },
  quake: { bg: "linear-gradient(180deg, var(--sun), var(--ali))", low: "🏠", high: "🌋", bar: "linear-gradient(90deg, var(--ali), var(--destructive))", shake: true },
  monster: { bg: "linear-gradient(180deg, var(--grape), var(--ink))", low: "👾", high: "👹", bar: "linear-gradient(90deg, var(--ali), var(--grape))", shake: true },
  thunder: { bg: "linear-gradient(180deg, var(--ink), var(--sky-deep))", low: "☁️", high: "⛈️", bar: "linear-gradient(90deg, var(--turq), var(--sun))" },
  energy: { bg: "linear-gradient(180deg, var(--aicha), var(--sun))", low: "🔋", high: "⚡", bar: "linear-gradient(90deg, var(--sun), var(--aicha))" },
  sonic: { bg: "linear-gradient(180deg, var(--turq), var(--sky-deep))", low: "💨", high: "💫", bar: "linear-gradient(90deg, var(--card), var(--grape))", wave: true },
  alien: { bg: "linear-gradient(180deg, var(--ink), var(--grape))", low: "🛸", high: "👽", bar: "linear-gradient(90deg, var(--ali), var(--turq))", wave: true },
};

function ThemedMeter({ value, peak, theme }: P & { theme: Theme }) {
  const hot = value > 75;
  const wave = Array.from({ length: 41 }, (_, i) => `${i * 5},${40 + Math.sin(i * 0.9 + value / 6) * (value / 100) * 34}`).join(" ");
  return (
    <div className={`card-game w-full overflow-hidden p-4 ${hot && theme.shake ? "anim-shake" : ""}`} style={{ background: theme.bg }}>
      <div className="flex items-center justify-between">
        <span className="leading-none transition-transform duration-100" style={{ fontSize: 48 + value * 0.5, transform: `rotate(${hot ? (value % 2 ? -8 : 8) : 0}deg)` }}>{hot ? theme.high : theme.low}</span>
        <span className="title-white text-6xl tabular-nums">{value}</span>
      </div>
      {theme.wave && (
        <svg viewBox="0 0 200 80" className="mt-2 h-16 w-full"><polyline points={wave} fill="none" stroke="var(--card)" strokeWidth="4" strokeLinecap="round" /></svg>
      )}
      <div className="relative mt-3 h-6 overflow-hidden rounded-full border-[3px] border-ink bg-card">
        <div className="h-full transition-[width] duration-75" style={{ width: `${value}%`, background: theme.bar }} />
        <div className="absolute inset-y-0 w-1 bg-ink" style={{ insetInlineStart: `${peak}%` }} />
      </div>
    </div>
  );
}

export function Meter({ style, value, peak }: P & { style: MeterId }) {
  const inner = style === "classic" ? <RpmMeter value={value} peak={peak} /> : style === "rocket" ? <RocketMeter value={value} peak={peak} /> : <ThemedMeter value={value} peak={peak} theme={THEMES[style]} />;
  return <div className="mx-auto w-full max-w-[300px]">{inner}</div>;
}

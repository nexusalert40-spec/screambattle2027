import type { MeterStyle } from "./store";

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
    <svg viewBox="0 0 200 190" className={`w-full ${value > 80 ? "anim-shake" : ""}`}>
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

function TmotorMeter({ value, peak }: P) {
  const dur = value < 3 ? 0 : 2.2 - (value / 100) * 2;
  return (
    <svg viewBox="0 0 200 200" className="w-full">
      <circle cx="100" cy="100" r="95" fill="var(--ink)" stroke="var(--turq)" strokeWidth="4" />
      {[80, 62, 44].map((r, i) => (
        <g key={r} style={{ transformOrigin: "100px 100px", animation: dur ? `spin ${dur * (i + 1) * 0.6}s linear infinite ${i % 2 ? "reverse" : ""}` : "none" }}>
          <circle cx="100" cy="100" r={r} fill="none" stroke={i === 1 ? "var(--aicha)" : "var(--turq)"} strokeWidth="5" strokeDasharray={`${r / 2} ${r / 4}`} />
        </g>
      ))}
      <circle cx="100" cy="100" r="88" fill="none" stroke="var(--sun)" strokeWidth="6" strokeDasharray={`${(peak / 100) * 553} 553`} transform="rotate(-90 100 100)" opacity="0.6" />
      <circle cx="100" cy="100" r="88" fill="none" stroke={zoneColor(value)} strokeWidth="6" strokeDasharray={`${(value / 100) * 553} 553`} transform="rotate(-90 100 100)" style={{ transition: "stroke-dasharray 0.08s" }} />
      <text x="100" y="114" textAnchor="middle" fontSize="40" fontFamily="var(--font-display)" fill="var(--card)">{value}</text>
    </svg>
  );
}

function DigitalMeter({ value, peak }: P) {
  const bars = 16;
  return (
    <div className="card-game w-full bg-ink p-4" style={{ background: "var(--ink)" }}>
      <div className="flex items-end justify-between font-display">
        <span className="text-7xl tabular-nums" style={{ color: zoneColor(value) }}>{String(value).padStart(3, "0")}</span>
        <span className="text-lg text-sun">PEAK {peak}</span>
      </div>
      <div className="mt-3 flex h-24 items-end gap-1">
        {[...Array(bars)].map((_, i) => {
          const wobble = 0.6 + 0.4 * Math.abs(Math.sin(i * 1.7 + value / 9));
          const h = Math.max(4, value * wobble);
          return <div key={i} className="flex-1 rounded-sm transition-all duration-75" style={{ height: `${h}%`, background: zoneColor((i / bars) * 100) }} />;
        })}
      </div>
    </div>
  );
}

export function Meter({ style, value, peak }: P & { style: MeterStyle }) {
  const M = { rpm: RpmMeter, rocket: RocketMeter, tmotor: TmotorMeter, digital: DigitalMeter }[style];
  return <div className="mx-auto w-full max-w-[300px]"><M value={value} peak={peak} /></div>;
}

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

/** Generic half-dial gauge used by speedometer, fuel and pressure styles. */
function Dial({ value, peak, face, labels, icon, needle = "var(--destructive)" }: P & { face: string; labels: string[]; icon: string; needle?: string }) {
  const ang = (v: number) => -90 + (v / 100) * 180;
  const pt = (v: number, r: number) => { const a = ((ang(v) - 90) * Math.PI) / 180; return [100 + r * Math.cos(a), 115 + r * Math.sin(a)]; };
  return (
    <svg viewBox="0 0 200 150" className={`w-full ${value > 85 ? "anim-shake" : ""}`}>
      <path d="M8 115 A92 92 0 0 1 192 115 L192 140 L8 140 Z" fill={face} stroke="var(--ink)" strokeWidth="5" />
      {[...Array(21)].map((_, i) => { const [x1, y1] = pt(i * 5, 82); const [x2, y2] = pt(i * 5, i % 5 ? 74 : 66); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i * 5 >= 80 ? "var(--destructive)" : "var(--card)"} strokeWidth={i % 5 ? 2 : 4} />; })}
      {labels.map((l, i) => { const [x, y] = pt((i / (labels.length - 1)) * 100, 52); return <text key={i} x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="900" fill="var(--card)">{l}</text>; })}
      <g transform={`rotate(${ang(peak)} 100 115)`}><polygon points="100,30 95,40 105,40" fill="var(--sun)" /></g>
      <g style={{ transition: "transform 0.08s" }} transform={`rotate(${ang(value)} 100 115)`}><polygon points="96,115 100,38 104,115" fill={needle} stroke="var(--ink)" strokeWidth="1.5" /></g>
      <circle cx="100" cy="115" r="10" fill="var(--ink)" />
      <text x="28" y="134" fontSize="18">{icon}</text>
      <text x="172" y="136" textAnchor="end" fontSize="22" fontFamily="var(--font-display)" fill="var(--card)">{value}</text>
    </svg>
  );
}

function Thermo({ value, peak }: P) {
  const h = (value / 100) * 130;
  return (
    <svg viewBox="0 0 200 190" className="w-full">
      <rect x="4" y="4" width="192" height="182" rx="24" fill="var(--card)" stroke="var(--ink)" strokeWidth="5" />
      <rect x="88" y="20" width="24" height="140" rx="12" fill="var(--muted)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="93" y={155 - h} width="14" height={h + 5} rx="7" fill={zoneColor(value)} style={{ transition: "all 0.08s" }} />
      <circle cx="100" cy="165" r="18" fill={zoneColor(value)} stroke="var(--ink)" strokeWidth="3" />
      <line x1="80" x2="120" y1={155 - (peak / 100) * 130} y2={155 - (peak / 100) * 130} stroke="var(--grape)" strokeWidth="3" />
      {[0, 25, 50, 75, 100].map((v) => <text key={v} x="72" y={159 - v * 1.3} textAnchor="end" fontSize="10" fontWeight="800" fill="var(--ink)">{v}°</text>)}
      <text x="160" y="60" textAnchor="middle" fontSize="34">{value > 75 ? "🔥" : value > 40 ? "♨️" : "🧊"}</text>
      <text x="160" y="120" textAnchor="middle" fontSize="32" fontFamily="var(--font-display)" fill="var(--ink)">{value}</text>
    </svg>
  );
}

function Watch({ value, peak }: P) {
  return (
    <svg viewBox="0 0 200 200" className="w-full">
      <rect x="70" y="0" width="60" height="200" rx="10" fill="var(--ink)" />
      <circle cx="100" cy="100" r="84" fill="var(--ink)" stroke="var(--muted-foreground)" strokeWidth="6" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="var(--muted)" strokeWidth="8" opacity="0.3" />
      <circle cx="100" cy="100" r="70" fill="none" stroke={zoneColor(value)} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(value / 100) * 440} 440`} transform="rotate(-90 100 100)" style={{ transition: "stroke-dasharray 0.08s" }} />
      <text x="100" y="72" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--turq)" letterSpacing="2">SCREAM</text>
      <text x="100" y="118" textAnchor="middle" fontSize="44" fontFamily="monospace" fontWeight="900" fill="var(--card)">{String(value).padStart(3, "0")}</text>
      <text x="100" y="142" textAnchor="middle" fontSize="12" fontFamily="monospace" fill="var(--sun)">PEAK {String(peak).padStart(3, "0")}</text>
    </svg>
  );
}

function DecibelScale({ value, peak }: P) {
  return (
    <div className="card-game w-full bg-ink p-3">
      <div className="flex h-36 items-end gap-1">
        {[...Array(20)].map((_, i) => { const on = value >= (i + 1) * 5; const c = i < 8 ? "var(--turq)" : i < 14 ? "var(--sun)" : "var(--destructive)"; return <div key={i} className="flex-1 rounded-sm" style={{ height: `${15 + i * 4.3}%`, background: c, opacity: on ? 1 : 0.18, outline: Math.round(peak / 5) === i + 1 ? "2px solid var(--card)" : undefined }} />; })}
      </div>
      <div className="mt-2 flex justify-between text-xs font-black text-card"><span>30 dB</span><span className="text-2xl">{Math.round(30 + value * 0.9)} dB</span><span>120 dB</span></div>
    </div>
  );
}

function WaveViz({ value, peak }: P) {
  const freq = 0.4 + value / 50;
  const wave = (off: number) => Array.from({ length: 81 }, (_, i) => `${i * 2.5},${60 + Math.sin(i * freq * 0.3 + off) * (4 + (value / 100) * 44)}`).join(" ");
  return (
    <svg viewBox="0 0 200 150" className="w-full">
      <rect x="4" y="4" width="192" height="142" rx="20" fill="var(--ink)" stroke="var(--grape)" strokeWidth="5" />
      {[30, 60, 90].map((y) => <line key={y} x1="10" x2="190" y1={y} y2={y} stroke="var(--grape)" strokeWidth="1" opacity="0.4" />)}
      <polyline points={wave(value / 8)} fill="none" stroke="var(--turq)" strokeWidth="3" />
      <polyline points={wave(value / 8 + 2)} fill="none" stroke="var(--aicha)" strokeWidth="2" opacity="0.7" />
      <text x="16" y="134" fontSize="13" fontFamily="monospace" fill="var(--turq)">{(value * 0.42).toFixed(1)} GHz</text>
      <text x="184" y="134" textAnchor="end" fontSize="11" fontFamily="monospace" fill="var(--sun)">MAX {peak}</text>
    </svg>
  );
}

function Battery({ value, peak }: P) {
  const cells = Math.ceil(value / 20);
  return (
    <svg viewBox="0 0 200 120" className={`w-full ${value > 90 ? "anim-shake" : ""}`}>
      <rect x="6" y="14" width="170" height="92" rx="14" fill="var(--card)" stroke="var(--ink)" strokeWidth="6" />
      <rect x="176" y="42" width="16" height="36" rx="4" fill="var(--ink)" />
      {[...Array(5)].map((_, i) => <rect key={i} x={16 + i * 32} y="24" width="27" height="72" rx="6" fill={i < cells ? zoneColor(value) : "var(--muted)"} />)}
      <line x1={16 + (peak / 100) * 155} x2={16 + (peak / 100) * 155} y1="18" y2="102" stroke="var(--grape)" strokeWidth="3" />
      <text x="91" y="72" textAnchor="middle" fontSize="30" fontFamily="var(--font-display)" fill="var(--ink)">{value}%{value > 80 ? "⚡" : ""}</text>
    </svg>
  );
}

export function Meter({ style, value, peak }: P & { style: MeterId }) {
  const p = { value, peak };
  const inner =
    style === "classic" ? <RpmMeter {...p} /> :
    style === "speed" ? <Dial {...p} face="var(--sky-deep)" labels={["0", "60", "120", "180", "240"]} icon="🏎️" /> :
    style === "fuel" ? <Dial {...p} face="var(--ink)" labels={["E", "¼", "½", "¾", "F"]} icon="⛽" needle="var(--sun)" /> :
    style === "heat" ? <Thermo {...p} /> :
    style === "pressure" ? <Dial {...p} face="var(--grape)" labels={["0", "2", "4", "6", "8", "10"]} icon="🧯" needle="var(--turq)" /> :
    style === "watch" ? <Watch {...p} /> :
    style === "rocket" ? <RocketMeter {...p} /> :
    style === "decibel" ? <DecibelScale {...p} /> :
    style === "wave" ? <WaveViz {...p} /> :
    <Battery {...p} />;
  return <div className="mx-auto w-full max-w-[300px]">{inner}</div>;
}

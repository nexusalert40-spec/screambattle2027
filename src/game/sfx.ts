// Tiny synthesized sound effects (no asset files needed).
let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return ctx;
}
function tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.08, slideTo?: number) {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, a.currentTime);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + dur);
  g.gain.setValueAtTime(vol, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  o.connect(g).connect(a.destination);
  o.start();
  o.stop(a.currentTime + dur);
}
export const sfx = {
  tap: (on: boolean) => on && tone(660, 0.08, "triangle", 0.06),
  tick: (on: boolean) => on && tone(520, 0.15, "square", 0.07),
  go: (on: boolean) => on && tone(440, 0.4, "sawtooth", 0.08, 1200),
  win: (on: boolean) => { if (!on) return; [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.18, "triangle", 0.08), i * 120)); },
  lose: (on: boolean) => on && tone(400, 0.6, "sawtooth", 0.06, 120),
};

/* ---------- Reaction sounds (only played after the microphone has stopped) ---------- */
function clap(at: number, vol = 0.25) {
  const a = ac();
  if (!a) return;
  const len = Math.floor(a.sampleRate * 0.06);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = a.createBufferSource();
  const f = a.createBiquadFilter();
  const g = a.createGain();
  src.buffer = buf; f.type = "bandpass"; f.frequency.value = 1200 + Math.random() * 800; g.gain.value = vol;
  src.connect(f).connect(g).connect(a.destination);
  src.start(a.currentTime + at);
}
/** Crowd applause: many overlapping hand claps. */
export function applause(on: boolean, seconds = 1.6) {
  if (!on) return;
  for (let t = 0; t < seconds; t += 0.035) clap(t + Math.random() * 0.03, 0.12 + Math.random() * 0.15 * (1 - t / seconds));
}
const VOICE_LANG: Record<string, string> = { ar: "ar-SA", en: "en-US", ru: "ru-RU", zh: "zh-CN", tr: "tr-TR", es: "es-ES", ms: "ms-MY", ur: "ur-PK" };
/** Speaks a short cheer with the device voice, in the player's language. */
export function say(on: boolean, phrase: string, lang: string) {
  if (!on || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(phrase);
  u.lang = VOICE_LANG[lang] ?? "en-US"; u.pitch = 1.4; u.rate = 1.05;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

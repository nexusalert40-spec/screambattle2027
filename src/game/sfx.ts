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

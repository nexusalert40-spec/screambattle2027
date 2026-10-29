/** Original 128 BPM arcade loop, synthesized locally; no recorded/licensed track. */
export function shouldPlayMusic(enabled: boolean, measuring: boolean, visible: boolean) {
  return enabled && !measuring && visible;
}

export class BattleMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | undefined;
  private step = 0;
  private enabled = false;

  async unlock() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx ??= new AC();
    if (!this.master) { this.master = this.ctx.createGain(); this.master.gain.value = 0; this.master.connect(this.ctx.destination); }
    await this.ctx.resume();
    if (!this.timer) { this.beat(); this.timer = setInterval(() => this.beat(), 60000 / 128 / 2); }
  }

  setPlaying(on: boolean) {
    this.enabled = on;
    if (this.ctx && this.master) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setValueAtTime(on ? 0.16 : 0, this.ctx.currentTime);
    }
  }

  private note(freq: number, length: number, type: OscillatorType, volume: number, end?: number) {
    if (!this.ctx || !this.master) return;
    const at = this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, at);
    if (end) o.frequency.exponentialRampToValueAtTime(end, at + length);
    g.gain.setValueAtTime(volume, at); g.gain.exponentialRampToValueAtTime(0.001, at + length);
    o.connect(g).connect(this.master); o.start(at); o.stop(at + length);
    o.onended = () => { o.disconnect(); g.disconnect(); };
  }

  private beat() {
    if (!this.enabled) return;
    const i = this.step++ % 64;
    const root = [48, 53, 55, 53][Math.floor(i / 16)] ?? 48;
    const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);
    if (i % 2 === 0) { this.note(135, 0.13, "sine", 0.8, 40); this.note(hz(root), 0.17, "triangle", 0.5); }
    if (i % 4 === 2) this.note(180, 0.07, "triangle", 0.3, 75);
    this.note(6500, 0.025, "square", 0.035, 4200);
    const melody = [0, 7, 12, 7, 4, 7, 14, 12, 0, 7, 12, 16, 14, 7, 4, 7];
    this.note(hz(root + 12 + (melody[i % 16] ?? 0)), 0.16, "triangle", 0.24);
  }

  close() { clearInterval(this.timer); this.timer = undefined; void this.ctx?.close().catch(() => {}); this.ctx = null; this.master = null; }
}
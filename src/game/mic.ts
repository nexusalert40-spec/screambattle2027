import { CALIBRATION_MS, ROUND_MS, dbToScore, isValidSample, rmsToDb } from "./scoring";

export type MicStatus = "unknown" | "granted" | "denied" | "unsupported";

export interface RoundResult {
  peak: number;
  valid: boolean;
  baselineDb: number;
}

/** Real Web Audio microphone analyzer. Raw processing (no AGC/noise suppression) so loudness is real. */
export class MicAnalyzer {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private buf: Float32Array<ArrayBuffer> | null = null;
  private raf: ReturnType<typeof setTimeout> | undefined;
  private stopped = false;

  static supported() {
    return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  }

  async open() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    if (this.ctx.state === "suspended") await this.ctx.resume();
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    src.connect(this.analyser);
    this.buf = new Float32Array(this.analyser.fftSize);
  }

  private readDb(): number {
    if (!this.analyser || !this.buf) return -100;
    this.analyser.getFloatTimeDomainData(this.buf);
    let sum = 0;
    for (let i = 0; i < this.buf.length; i++) { const v = this.buf[i] ?? 0; sum += v * v; }
    return rmsToDb(Math.sqrt(sum / this.buf.length));
  }

  /** Measures background noise; returns baseline dB. */
  calibrate(): Promise<number> {
    return new Promise((resolve) => {
      const samples: number[] = [];
      const start = performance.now();
      const tick = () => {
        if (this.stopped) return resolve(-60);
        samples.push(this.readDb());
        if (performance.now() - start < CALIBRATION_MS) this.raf = setTimeout(tick, 30);
        else {
          samples.sort((a, b) => a - b);
          resolve(samples[Math.floor(samples.length * 0.75)] ?? -60);
        }
      };
      tick();
    });
  }

  /** Live level for idle meters (practice). */
  level(): number {
    return dbToScore(this.readDb());
  }

  /** Captures a 5 s round. onFrame gets a smoothed live score + valid peak so far. */
  runRound(baselineDb: number, onFrame: (live: number, peak: number, msLeft: number) => void): Promise<RoundResult> {
    return new Promise((resolve) => {
      let peak = 0;
      let valid = false;
      let smooth = 0;
      const start = performance.now();
      const tick = () => {
        const elapsed = performance.now() - start;
        const db = this.readDb();
        const score = dbToScore(db);
        smooth = smooth + (score - smooth) * 0.35;
        if (isValidSample(db, baselineDb)) {
          valid = true;
          if (score > peak) peak = score;
        }
        onFrame(Math.round(smooth), peak, Math.max(0, ROUND_MS - elapsed));
        if (elapsed >= ROUND_MS || this.stopped) {
          resolve({ peak: valid ? peak : 0, valid, baselineDb });
          return;
        }
        this.raf = setTimeout(tick, 30);
      };
      tick();
    });
  }

  close() {
    this.stopped = true;
    clearTimeout(this.raf);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.ctx?.close().catch(() => {});
    this.stream = null;
    this.ctx = null;
    this.analyser = null;
  }
}

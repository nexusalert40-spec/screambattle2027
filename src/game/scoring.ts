// Pure scoring rules shared by every meter style and mode.
export const ROUND_MS = 5000;
export const CALIBRATION_MS = 1500;
/** dB a sample must exceed the measured background by to count as a valid scream. */
export const VALID_THRESHOLD_DB = 8;
/** dBFS that maps to a score of 0 and 100. */
export const DB_FLOOR = -60;
export const DB_CEIL = -3;

export function rmsToDb(rms: number): number {
  return 20 * Math.log10(Math.max(rms, 1e-8));
}

export function dbToScore(db: number): number {
  const s = ((db - DB_FLOOR) / (DB_CEIL - DB_FLOOR)) * 100;
  return Math.round(Math.min(100, Math.max(0, s)));
}

export function isValidSample(db: number, baselineDb: number): boolean {
  return db >= baselineDb + VALID_THRESHOLD_DB;
}

export type Difficulty = "easy" | "normal" | "hard";
export const AI_RANGES: Record<Difficulty, [number, number]> = {
  easy: [35, 55],
  normal: [55, 75],
  hard: [72, 92],
};
/** Disclosed AI opponent simulation — never used for a human score. */
export function aiOpponentScore(d: Difficulty, rand: () => number = Math.random): number {
  const [lo, hi] = AI_RANGES[d];
  return Math.round(lo + rand() * (hi - lo));
}

export type Outcome = "a" | "b" | "tie";
export function decideWinner(a: number, b: number): Outcome {
  if (a === b) return "tie";
  return a > b ? "a" : "b";
}

export type Cheer = "go" | "champ" | "bravo";
/** Which motivational reaction a scream peak earns: 50+ "Let's go!", 70+ applause + "Keep going, champion!", 90+ big applause + "Bravo!". */
export function cheerFor(peak: number): Cheer | null {
  if (peak >= 90) return "bravo";
  if (peak >= 70) return "champ";
  if (peak >= 50) return "go";
  return null;
}

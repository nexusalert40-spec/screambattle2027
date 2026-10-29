import ali from "@/assets/char-ali.png";
import aicha from "@/assets/char-aicha.png";
import hero from "@/assets/char-hero.png";
import astro from "@/assets/char-astro.png";
import robot from "@/assets/char-robot.png";
import wizard from "@/assets/char-wizard.png";

export type Tier = "free" | "premium";
export type Theme = "ali" | "aicha" | "sun" | "turq" | "grape";

export interface Character {
  id: string;
  name: { en: string; ar: string };
  image: string;
  theme: Theme;
  tier: Tier;
}

// Add new characters here — the rest of the game reads from this catalog.
export const CHARACTERS: Character[] = [
  { id: "ali", name: { en: "Ali", ar: "علي" }, image: ali, theme: "ali", tier: "free" },
  { id: "aicha", name: { en: "Aicha", ar: "عائشة" }, image: aicha, theme: "aicha", tier: "free" },
  { id: "robo", name: { en: "Beep-O", ar: "بيبو" }, image: robot, theme: "turq", tier: "free" },
  { id: "hero", name: { en: "Captain Loud", ar: "كابتن صوت" }, image: hero, theme: "sun", tier: "premium" },
  { id: "astro", name: { en: "Nova", ar: "نوفا" }, image: astro, theme: "turq", tier: "premium" },
  { id: "wizard", name: { en: "Zizo the Wizard", ar: "زيزو الساحر" }, image: wizard, theme: "grape", tier: "premium" },
];

export const themeBg: Record<Theme, string> = {
  ali: "bg-ali-grad",
  aicha: "bg-aicha-grad",
  sun: "bg-sun-grad",
  turq: "bg-turq-grad",
  grape: "bg-grape-grad",
};

export function getChar(id: string) {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}

/** Owned = free, or granted by a verified entitlement (none until store billing is configured). */
export function isOwned(c: Character, entitlements: string[]) {
  return c.tier === "free" || entitlements.includes(c.id);
}

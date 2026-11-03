import ali from "@/assets/char-ali.png";
import aicha from "@/assets/char-aicha.png";
import hero from "@/assets/char-hero.png";
import astro from "@/assets/char-astro.png";
import robot from "@/assets/char-robot.png";
import wizard from "@/assets/char-wizard.png";
import ninja from "@/assets/char-ninja.png";
import dino from "@/assets/char-dino.png";
import rockstar from "@/assets/char-rockstar.png";
import pirate from "@/assets/char-pirate.png";
import aliShout from "@/assets/char-ali-shout.png";
import aichaShout from "@/assets/char-aicha-shout.png";
import heroShout from "@/assets/char-hero-shout.png";
import astroShout from "@/assets/char-astro-shout.png";
import robotShout from "@/assets/char-robot-shout.png";
import wizardShout from "@/assets/char-wizard-shout.png";

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
  { id: "ninja", name: { en: "Kiko Ninja", ar: "كيكو النينجا" }, image: ninja, theme: "sun", tier: "premium" },
  { id: "dino", name: { en: "Rawr-a", ar: "رورا" }, image: dino, theme: "ali", tier: "premium" },
  { id: "rockstar", name: { en: "Lulu Rock", ar: "لولو روك" }, image: rockstar, theme: "grape", tier: "premium" },
  { id: "pirate", name: { en: "Captain Yoho", ar: "القبطان يوهو" }, image: pirate, theme: "aicha", tier: "premium" },
];

export const themeBg: Record<Theme, string> = {
  ali: "bg-ali-grad",
  aicha: "bg-aicha-grad",
  sun: "bg-sun-grad",
  turq: "bg-turq-grad",
  grape: "bg-grape-grad",
};

export const shoutImages: Record<string, string> = { ali: aliShout, aicha: aichaShout, hero: heroShout, astro: astroShout, robo: robotShout, wizard: wizardShout };
export function characterName(c: Character, lang: string) { return lang === "ar" || lang === "ur" ? c.name.ar : c.name.en; }

export function getChar(id: string): Character {
  const c = CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
  if (!c) throw new Error("Character catalog is empty");
  return c;
}

/** Owned = free, or granted by a verified entitlement (none until store billing is configured). */
export const PREMIUM_ALL = "premium-all";
export function isOwned(c: Character, entitlements: string[]) {
  return c.tier === "free" || entitlements.includes(c.id) || entitlements.includes(PREMIUM_ALL);
}

/**
 * Pure product catalog shared by the browser and the payment server functions.
 * The server always prices orders from here; the client never sends an amount.
 */
export const PREMIUM_ALL = "premium-all";
export const SUPER_MOUTH = "super-mouth";
export const ADVANCED_METERS = "advanced-meters";
export const SCREAM_EFFECTS = "scream-effects";

export const METERS = ["classic", "fire", "glass", "quake", "monster", "rocket", "thunder", "energy", "sonic", "alien"] as const;
export type MeterId = (typeof METERS)[number];
export const FREE_METER: MeterId = "classic";
export const isMeterId = (v: unknown): v is MeterId => METERS.includes(v as MeterId);

export const PREMIUM_CHARACTER_IDS = ["hero", "astro", "wizard", "ninja", "dino", "rockstar", "pirate"] as const;
export const ALL_CHARACTER_IDS = ["ali", "aicha", "robo", ...PREMIUM_CHARACTER_IDS] as const;

export const meterEntitlement = (id: MeterId) => `meter:${id}`;

/** Classic is free; other meters need the single meter, the Advanced Meters pack or Premium. */
export function isMeterOwned(id: MeterId, entitlements: string[]) {
  return id === FREE_METER || entitlements.includes(meterEntitlement(id)) || entitlements.includes(ADVANCED_METERS) || entitlements.includes(PREMIUM_ALL);
}

/** Price in US cents for a purchasable product id, or null if it is not for sale. */
export function priceCents(productId: string): number | null {
  if (productId === PREMIUM_ALL) return 499;
  if (productId === ADVANCED_METERS) return 199;
  if (productId === SUPER_MOUTH || productId === SCREAM_EFFECTS) return 99;
  if ((PREMIUM_CHARACTER_IDS as readonly string[]).includes(productId)) return 99;
  if (productId.startsWith("room:") && (PREMIUM_CHARACTER_IDS as readonly string[]).includes(productId.slice(5))) return 99;
  if (productId.startsWith("meter:")) {
    const m = productId.slice(6);
    return isMeterId(m) && m !== FREE_METER ? 99 : null;
  }
  return null;
}

export const formatUsd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

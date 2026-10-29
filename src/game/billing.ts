/**
 * Platform billing boundary. No provider here ever reports a purchase as successful
 * on its own: real Google Play / App Store / web checkout providers must be wired in
 * and every transaction verified server-side before entitlements are granted.
 */
export type Platform = "web" | "android" | "ios";

export interface Product { id: string; kind: "character" | "bundle" | "coins" | "upgrade" }

export type PurchaseOutcome =
  | { status: "unavailable"; reason: string }
  | { status: "cancelled" }
  | { status: "pending_verification"; platform: Platform; receipt: string };

export interface BillingService {
  platform: Platform;
  available(): Promise<boolean>;
  purchase(product: Product): Promise<PurchaseOutcome>;
  /** Returns entitlements confirmed by the verification backend only. */
  verifiedEntitlements(): Promise<string[]>;
}

export class UnavailableBilling implements BillingService {
  constructor(public platform: Platform) {}
  async available() { return false; }
  async purchase(): Promise<PurchaseOutcome> {
    return { status: "unavailable", reason: `Store billing is not configured for ${this.platform}.` };
  }
  async verifiedEntitlements() { return []; }
}

export function detectPlatform(): Platform {
  if (typeof window === "undefined") return "web";
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const p = cap?.getPlatform?.();
  return p === "android" || p === "ios" ? p : "web";
}

export function getBilling(): BillingService {
  return new UnavailableBilling(detectPlatform());
}

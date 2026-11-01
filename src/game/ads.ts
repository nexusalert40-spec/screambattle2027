// AdMob rewarded interstitial — native Android app only (AdMob does not run on websites).
import { Capacitor } from "@capacitor/core";

export const ADMOB_APP_ID = "ca-app-pub-8012316494094103~1293652283";
export const REWARDED_INTERSTITIAL_ID = "ca-app-pub-8012316494094103/2663021385";
export const ROUNDS_PER_AD = 3;

let rounds = 0;
let ready: Promise<boolean> | null = null;

export const adsSupported = () => Capacitor.getPlatform() === "android";

async function init() {
  if (!adsSupported()) return false;
  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.initialize({});
    // Google consent form (required for EU/UK visitors).
    try {
      const info = await AdMob.requestConsentInfo();
      if (info.isConsentFormAvailable && info.status === "REQUIRED") await AdMob.showConsentForm();
    } catch { /* consent form unavailable; ads continue as non-personalized per Google settings */ }
    return true;
  } catch { return false; }
}

/** Counts a finished round; true when the pre-ad notice should be shown. Never during mic capture. */
export function roundFinished(): boolean {
  if (!adsSupported()) return false;
  rounds += 1;
  return rounds % ROUNDS_PER_AD === 0;
}

export async function showRewardedAd(): Promise<boolean> {
  ready ??= init();
  if (!(await ready)) return false;
  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.prepareRewardInterstitialAd({ adId: REWARDED_INTERSTITIAL_ID });
    await AdMob.showRewardInterstitialAd();
    return true;
  } catch { return false; }
}

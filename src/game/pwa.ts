/// <reference types="vite-plugin-pwa/client" />
// Single place that registers the offline service worker and tracks the browser's install prompt.
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

const SW_URL = "/sw.js";
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;

function isPreviewHost(host: string) {
  const first = host.split(".")[0] ?? "";
  if (/\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(host)) {
    if (PREVIEW_LABEL.test(first) || /^project--.+-dev$/.test(first)) return true;
  }
  return [/(^|\.)lovableproject\.com$/, /(^|\.)lovableproject-dev\.com$/, /(^|\.)beta\.lovable\.dev$/].some((r) => r.test(host));
}

function refused() {
  if (!import.meta.env.PROD) return true;
  if (Capacitor.isNativePlatform()) return true;
  try { if (window.self !== window.top) return true; } catch { return true; }
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return isPreviewHost(window.location.hostname.toLowerCase());
}

async function unregisterAppWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.filter((r) => r.active?.scriptURL.endsWith(SW_URL) || r.installing?.scriptURL.endsWith(SW_URL) || r.waiting?.scriptURL.endsWith(SW_URL)).map((r) => r.unregister()));
}

export async function setupServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (refused()) { await unregisterAppWorkers(); return; }
  const { registerSW } = await import("virtual:pwa-register");
  registerSW({ immediate: true });
}

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e as InstallEvent; listeners.forEach((l) => l()); });
  window.addEventListener("appinstalled", () => { deferred = null; listeners.forEach((l) => l()); });
}

/** Install state for the Download App section. Read after mount to avoid hydration mismatches. */
export function useInstall() {
  const [, tick] = useState(0);
  const [env, setEnv] = useState({ native: false, standalone: false, ios: false });
  useEffect(() => {
    const l = () => tick((n) => n + 1);
    listeners.add(l);
    setEnv({
      native: Capacitor.isNativePlatform(),
      standalone: window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true,
      ios: /iphone|ipad|ipod/i.test(navigator.userAgent),
    });
    return () => { listeners.delete(l); };
  }, []);
  return {
    ...env,
    canPrompt: deferred !== null,
    prompt: async () => { if (!deferred) return; await deferred.prompt(); await deferred.userChoice; deferred = null; tick((n) => n + 1); },
  };
}

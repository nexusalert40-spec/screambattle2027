// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

// Generates /sw.js with Workbox after the browser bundle is written (offline support for the web app).
// Registration happens only in src/game/pwa.ts, which refuses previews, iframes, dev and native apps.
function offlineWorker(): Plugin {
  let done = false;
  return {
    name: "scream-offline-worker",
    apply: "build",
    async closeBundle() {
      const env = (this as { environment?: { name: string; config: { build: { outDir: string } } } }).environment;
      if (done || !env || env.name !== "client") return;
      done = true;
      const { generateSW } = await import("workbox-build");
      const dir = env.config.build.outDir;
      await generateSW({
        globDirectory: dir,
        swDest: `${dir}/sw.js`,
        globPatterns: ["assets/**/*.{js,css,webp,png,svg,woff2}", "icons/*.webp", "*.png"],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
            handler: "NetworkFirst",
            options: { cacheName: "pages", networkTimeoutSeconds: 4 },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "fonts" },
          },
        ],
      });
    },
  };
}

// NATIVE_BUILD=1 produces a static single-page bundle (dist/client) for Capacitor.
// The default build stays the SSR web build deployed over HTTPS.
const native = process.env['NATIVE_BUILD'] === "1";

export default defineConfig({
  tanstackStart: native
    ? { spa: { enabled: true } }
    : {
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        server: { entry: "server" },
      },
  ...(native ? { nitro: false as const } : {}),
  vite: { plugins: [offlineWorker()] },
});

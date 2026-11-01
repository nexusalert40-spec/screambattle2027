# Scream Battle — Build & Release Guide

## 1. Project overview
- **Stack:** TanStack Start (React 19, Vite), Tailwind v4. Game code in `src/game`, single route `/`.
- **Web build:** `npm run build` → SSR app for Cloudflare Workers (Lovable publish serves it over HTTPS).
- **Native build:** `npm run build:native` → static SPA in `dist/client` (`NATIVE_BUILD=1`, see `vite.config.ts`). Capacitor's `webDir` points here.
- **Native shell:** Capacitor 7 (`capacitor.config.ts`), projects in `android/` and `ios/`.
- **Backend:** none connected yet. No server secrets exist in the frontend.
- **Microphone:** `src/game/mic.ts` (Web Audio, raw, never recorded or uploaded).
- **Billing:** `src/game/billing.ts` interface; every platform currently returns `unavailable`.

## 2. Web deployment (HTTPS)
Publish from Lovable (HTTPS by default) or connect a custom domain in Project Settings → Domains.
Microphone access requires HTTPS (or localhost) in every browser.

## 3. GitHub sync
Lovable → Project Settings → GitHub → Connect. Every change is pushed; pull locally:
```sh
git clone <repo> && cd <repo> && npm install
```

## 4. App identity (required before release)
Set a reverse-domain ID **you own** and the store name, then sync:
```sh
CAP_APP_ID=com.yourcompany.screambattle CAP_APP_NAME="Scream Battle" npm run cap:sync
```
The generated projects currently use the placeholder `com.example.screambattle`. Changing the ID after
generation also requires: Android `applicationId`/`namespace` in `android/app/build.gradle` (+ move
`MainActivity.java` package), iOS Bundle Identifier in Xcode. Easiest: delete `android/`/`ios/` and re-run
`npx cap add android` / `npx cap add ios` with the env vars set, then re-apply section 6.

## 5. Daily native workflow
```sh
npm install
npm run cap:sync          # build:native + copy web bundle + update plugins
npm run cap:android       # opens Android Studio
npm run cap:ios           # opens Xcode (macOS only; run `cd ios/App && pod install` once)
```
Icons/splash are generated from `resources/icon.png` and `resources/splash.png`:
`npm run cap:assets`.

## 6. Microphone & platform config (already applied)
- **Android** `AndroidManifest.xml`: `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, optional mic feature,
  portrait `MainActivity`. Capacitor's WebView client requests the runtime permission when the game calls
  `getUserMedia`.
- **iOS** `Info.plist`: `NSMicrophoneUsageDescription`, portrait only. iOS 14.3+ WKWebView supports `getUserMedia`.
- **Lifecycle:** the mic opens only after the player taps *Allow mic*/*Start*; it closes when the 5 s round
  ends, when the screen unmounts, and when the app goes to background (round is cancelled). Music is
  silenced while measuring.
- **Browsers:** Chrome/Edge/Firefox Android and Safari iOS 14.3+ over HTTPS. In-app browsers
  (Instagram/Facebook) may block the mic — the game shows the "mic unavailable" state.

## 7. Startup / intro
Native splash (orange brand screen) shows for ~1.5 s, then the in-app animated Ali vs Aicha intro plays.
The intro is CSS animation (no video file), so it works offline on every platform. If a video intro is added
later, keep the CSS intro as the fallback when autoplay is blocked.

## 8. Billing (not live)
`BillingService` (`src/game/billing.ts`) separates platforms. Nothing grants items locally. To go live:
1. **Android:** create products in Play Console; integrate Google Play Billing via a Capacitor plugin
   (e.g. RevenueCat `@revenuecat/purchases-capacitor` or `cordova-plugin-purchase`).
2. **iOS:** create products in App Store Connect (Paid Apps agreement, tax & banking); integrate StoreKit via the same plugin.
3. **Web:** a web checkout provider (e.g. Paddle/Stripe) — Store rules forbid web checkout for digital goods inside native apps.
4. **Verification:** send purchase token/receipt to a backend (Lovable Cloud server function) that verifies with
   Google Play Developer API / App Store Server API, stores entitlements per user, and handles refunds via
   Play RTDN / App Store Server Notifications.
5. Implement a provider returning `pending_verification`, and only use `verifiedEntitlements()` from the backend.

## 9. Backend environment variables (when Lovable Cloud is enabled)
| Variable | Where | Notes |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | frontend | public, safe to ship |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | never `VITE_`-prefixed, never in native bundle |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | server only | Play purchase verification |
| `APPLE_IAP_KEY_ID`, `APPLE_IAP_ISSUER_ID`, `APPLE_IAP_PRIVATE_KEY` | server only | App Store Server API |
Native apps call the **published HTTPS URL** for server functions; set it as the API base when backend is added.

## 10. Android release (AAB)
1. Create an upload keystore (keep it safe, never commit):
   `keytool -genkey -v -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000`
2. Android Studio → Build → Generate Signed Bundle → Android App Bundle, or configure `signingConfigs`
   with values from `~/.gradle/gradle.properties` and run `cd android && ./gradlew bundleRelease`.
3. Output: `android/app/build/outputs/bundle/release/app-release.aab`.
4. Bump `versionCode`/`versionName` in `android/app/build.gradle` each release.

## 11. iOS release (archive)
1. macOS + Xcode 15+, Apple Developer account. `cd ios/App && pod install`.
2. Xcode → App target → Signing & Capabilities: select team, set Bundle ID; add *In-App Purchase* capability when billing is added.
3. Product → Archive → Distribute App → App Store Connect.

## 12. Testing checklist
- `npm test` (unit tests: scoring, music muting, i18n, billing never fakes success).
- Real devices: first-launch mic prompt, deny → error screen → retry, background during round, rotate device, notch devices, Arabic/Urdu RTL, music on/off.
- Internal testing track (Play) / TestFlight (iOS) before production.

## 13. Store submission
- Privacy policy URL (state: microphone audio processed on device, not stored).
- Play: Data safety form, content rating, target audience (if children: Families policy).
- App Store: privacy nutrition labels, age rating, mic usage explanation in review notes.
- Screenshots per device size; icon from `resources/icon.png`.

## Install as an app (PWA) and store badges
- `public/manifest.webmanifest` makes the site installable; the build generates `/sw.js` (Workbox, network-first pages) for offline play.
- The worker registers only on the published site — never in previews, iframes, dev, or inside the Capacitor apps. Add `?sw=off` to any URL to remove it.
- The "Download App" section's App Store / Google Play badges are disabled until the store listings exist. When published, add the real listing URLs in `DownloadApp` (src/game/App.tsx).

## AdMob (Android)
- App ID is in AndroidManifest.xml; rewarded interstitial unit in src/game/ads.ts, offered after every 3rd round with a Skip option.
- Run `NATIVE_BUILD=1 bun run build && npx cap sync android`. Add app-ads.txt on your domain and set up the consent message in AdMob (Privacy & messaging). Ads are off on the website.

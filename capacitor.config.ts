import type { CapacitorConfig } from "@capacitor/cli";

// Override with env vars at `cap sync` time; replace the placeholder ID with a domain you own.
const config: CapacitorConfig = {
  appId: process.env.CAP_APP_ID ?? "com.example.screambattle",
  appName: process.env.CAP_APP_NAME ?? "Scream Battle",
  webDir: "dist/client",
  backgroundColor: "#ff7a1a",
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#ff7a1a",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
  },
  ios: { contentInset: "never" },
  android: { allowMixedContent: false },
};

export default config;

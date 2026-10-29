// Builds the static web bundle that Capacitor copies into the Android/iOS apps.
import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";

execSync("npx vite build", { stdio: "inherit", env: { ...process.env, NATIVE_BUILD: "1" } });
const dir = "dist/client";
if (!existsSync(`${dir}/index.html`)) {
  if (!existsSync(`${dir}/_shell.html`)) throw new Error("SPA shell not found in dist/client");
  copyFileSync(`${dir}/_shell.html`, `${dir}/index.html`);
}
console.log("Native web bundle ready in dist/client");

import { describe, expect, it } from "vitest";
import { isLang, LANGUAGES } from "./i18n";

describe("supported game languages", () => {
  for (const id of ["ar", "en", "ru", "zh", "tr", "es", "ms", "ur", "ja"]) {
    it(`supports ${id}`, () => expect(isLang(id)).toBe(true));
  }
  it("Arabic uses right-to-left direction", () => expect(LANGUAGES.find((l) => l.id === "ar")?.dir).toBe("rtl"));
  it("Urdu uses right-to-left direction", () => expect(LANGUAGES.find((l) => l.id === "ur")?.dir).toBe("rtl"));
  it("rejects unsupported saved languages", () => expect(isLang("unknown")).toBe(false));
});
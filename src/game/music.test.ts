import { describe, expect, it } from "vitest";
import { shouldPlayMusic } from "./music";

describe("battle music", () => {
  it("plays when enabled outside microphone measurement", () => expect(shouldPlayMusic(true, false, true)).toBe(true));
  it("stays silent during microphone measurement", () => expect(shouldPlayMusic(true, true, true)).toBe(false));
  it("respects the music off setting", () => expect(shouldPlayMusic(false, false, true)).toBe(false));
  it("stays silent in hidden tabs", () => expect(shouldPlayMusic(true, false, false)).toBe(false));
});
import { describe, expect, it } from "vitest";
import { aiOpponentScore, dbToScore, decideWinner, isValidSample, ROUND_MS } from "./scoring";

describe("scoring rules", () => {
  it("round lasts five seconds", () => expect(ROUND_MS).toBe(5000));
  it("score is clamped 0..100", () => {
    expect(dbToScore(-90)).toBe(0);
    expect(dbToScore(0)).toBe(100);
  });
  it("sample must beat background to be valid", () => {
    expect(isValidSample(-45, -50)).toBe(false);
    expect(isValidSample(-30, -50)).toBe(true);
  });
  it("hard AI stays within 72..92", () => {
    expect(aiOpponentScore("hard", () => 0)).toBe(72);
    expect(aiOpponentScore("hard", () => 1)).toBe(92);
  });
  it("equal scores tie", () => expect(decideWinner(60, 60)).toBe("tie"));
});

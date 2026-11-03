import { describe, expect, it } from "vitest";
import { cheerFor } from "./reactions";

describe("reaction milestones", () => {
  it("no cheer below 50", () => expect(cheerFor(49)).toBeNull());
  it("Let's go! from 50", () => expect(cheerFor(50)).toBe("go"));
  it("champion cheer from 70", () => expect(cheerFor(70)).toBe("champ"));
  it("big applause from 90", () => expect(cheerFor(90)).toBe("bravo"));
});

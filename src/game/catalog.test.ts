import { describe, expect, it } from "vitest";
import { isMeterOwned, METERS, priceCents } from "./catalog";

describe("shop prices", () => {
  it("Premium unlock-all costs $4.99", () => expect(priceCents("premium-all")).toBe(499));
  it("Advanced Meters costs $1.99", () => expect(priceCents("advanced-meters")).toBe(199));
  it("Scream Effects costs $0.99", () => expect(priceCents("scream-effects")).toBe(99));
  it("a single premium character costs $0.99", () => expect(priceCents("pirate")).toBe(99));
  it("free characters and the free meter are not for sale", () => {
    expect(priceCents("ali")).toBeNull();
    expect(priceCents("meter:classic")).toBeNull();
  });
  it("unknown products are not for sale", () => expect(priceCents("free-coins")).toBeNull());
});

describe("scream meters", () => {
  it("there are 10 meters", () => expect(METERS.length).toBe(10));
  it("only the Classic meter is free", () => expect(METERS.filter((m) => isMeterOwned(m, []))).toEqual(["classic"]));
  it("Premium unlocks every meter", () => expect(METERS.every((m) => isMeterOwned(m, ["premium-all"]))).toBe(true));
  it("a single meter purchase unlocks only that meter", () => {
    expect(isMeterOwned("fire", ["meter:fire"])).toBe(true);
    expect(isMeterOwned("alien", ["meter:fire"])).toBe(false);
  });
});

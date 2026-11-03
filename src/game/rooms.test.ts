import { describe, expect, it } from "vitest";
import { CHARACTERS, getChar, isOwned, PREMIUM_ALL } from "./characters";
import { ROOMS, isRoomOwned, roomEntitlement } from "./rooms";

describe("unlock rules", () => {
  it("has 10 characters, each with its own room", () => {
    expect(CHARACTERS).toHaveLength(10);
    expect(ROOMS.map((r) => r.id)).toEqual(CHARACTERS.map((c) => c.id));
  });
  it("premium characters and rooms stay locked without a verified entitlement", () => {
    const ninja = getChar("ninja");
    const room = ROOMS.find((r) => r.id === "ninja")!;
    expect(isOwned(ninja, [])).toBe(false);
    expect(isRoomOwned(room, ninja, [])).toBe(false);
  });
  it("Premium unlocks all 10 characters and all rooms", () => {
    expect(CHARACTERS.every((c) => isOwned(c, [PREMIUM_ALL]))).toBe(true);
    expect(ROOMS.every((r) => isRoomOwned(r, getChar(r.charId), [PREMIUM_ALL]))).toBe(true);
  });
  it("a single room purchase unlocks only that room", () => {
    const ents = [roomEntitlement("pirate")];
    expect(isRoomOwned(ROOMS.find((r) => r.id === "pirate")!, getChar("pirate"), ents)).toBe(true);
    expect(isRoomOwned(ROOMS.find((r) => r.id === "dino")!, getChar("dino"), ents)).toBe(false);
  });
});

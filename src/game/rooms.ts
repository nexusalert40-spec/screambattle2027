import { CHARACTERS, PREMIUM_ALL, type Character } from "./characters";

export type Reaction = "bounce" | "spin" | "shake" | "pop";
export interface RoomItem { emoji: string; x: number; y: number; size: number; react: Reaction }
export interface Room { id: string; charId: string; window: string; items: RoomItem[] }

// One dedicated room per character (room id = character id). Positions are % of the scene.
const DECOR: Record<string, { window: string; items: RoomItem[] }> = {
  ali: { window: "☀️", items: [{ emoji: "⚽", x: 12, y: 78, size: 40, react: "bounce" }, { emoji: "🛋️", x: 70, y: 66, size: 70, react: "shake" }, { emoji: "🪴", x: 88, y: 50, size: 44, react: "shake" }, { emoji: "🖼️", x: 40, y: 18, size: 42, react: "spin" }] },
  aicha: { window: "🌈", items: [{ emoji: "🧸", x: 14, y: 72, size: 52, react: "bounce" }, { emoji: "🎀", x: 84, y: 20, size: 36, react: "spin" }, { emoji: "🌸", x: 86, y: 60, size: 44, react: "pop" }, { emoji: "🎹", x: 66, y: 74, size: 56, react: "shake" }] },
  robo: { window: "🛰️", items: [{ emoji: "🔋", x: 12, y: 74, size: 44, react: "pop" }, { emoji: "🖥️", x: 76, y: 62, size: 60, react: "shake" }, { emoji: "⚙️", x: 40, y: 16, size: 40, react: "spin" }, { emoji: "💡", x: 88, y: 24, size: 36, react: "pop" }] },
  hero: { window: "🏙️", items: [{ emoji: "🦸", x: 14, y: 20, size: 40, react: "spin" }, { emoji: "🏆", x: 82, y: 64, size: 50, react: "bounce" }, { emoji: "🥊", x: 12, y: 76, size: 44, react: "shake" }, { emoji: "⭐", x: 44, y: 14, size: 34, react: "spin" }] },
  astro: { window: "🪐", items: [{ emoji: "🚀", x: 84, y: 60, size: 56, react: "bounce" }, { emoji: "🌙", x: 16, y: 16, size: 40, react: "spin" }, { emoji: "🔭", x: 14, y: 72, size: 50, react: "shake" }, { emoji: "✨", x: 50, y: 12, size: 32, react: "pop" }] },
  wizard: { window: "🌌", items: [{ emoji: "🔮", x: 82, y: 66, size: 50, react: "pop" }, { emoji: "📚", x: 14, y: 74, size: 50, react: "shake" }, { emoji: "🕯️", x: 88, y: 24, size: 36, react: "bounce" }, { emoji: "🧪", x: 40, y: 16, size: 36, react: "spin" }] },
  ninja: { window: "🏯", items: [{ emoji: "🎋", x: 12, y: 60, size: 60, react: "shake" }, { emoji: "🥋", x: 84, y: 22, size: 40, react: "spin" }, { emoji: "🏮", x: 44, y: 14, size: 36, react: "bounce" }, { emoji: "🍙", x: 82, y: 74, size: 40, react: "pop" }] },
  dino: { window: "🌋", items: [{ emoji: "🦴", x: 14, y: 76, size: 44, react: "spin" }, { emoji: "🥚", x: 84, y: 72, size: 44, react: "shake" }, { emoji: "🌴", x: 86, y: 40, size: 56, react: "shake" }, { emoji: "🦖", x: 40, y: 16, size: 38, react: "bounce" }] },
  rockstar: { window: "🎆", items: [{ emoji: "🎸", x: 14, y: 66, size: 58, react: "shake" }, { emoji: "🥁", x: 82, y: 72, size: 52, react: "bounce" }, { emoji: "🎤", x: 86, y: 24, size: 38, react: "spin" }, { emoji: "🎶", x: 42, y: 14, size: 36, react: "pop" }] },
  pirate: { window: "🌊", items: [{ emoji: "🏴‍☠️", x: 14, y: 18, size: 40, react: "shake" }, { emoji: "💰", x: 84, y: 72, size: 50, react: "bounce" }, { emoji: "🦜", x: 86, y: 30, size: 42, react: "pop" }, { emoji: "⚓", x: 12, y: 74, size: 46, react: "spin" }] },
};

export const ROOMS: Room[] = CHARACTERS.map((c) => ({ id: c.id, charId: c.id, ...(DECOR[c.id] ?? { window: "⭐", items: [] }) }));

export const roomEntitlement = (id: string) => `room:${id}`;

/** Rooms of free characters are free; others need a verified room or Premium entitlement. */
export function isRoomOwned(room: Room, char: Character, entitlements: string[]) {
  return char.tier === "free" || entitlements.includes(roomEntitlement(room.id)) || entitlements.includes(PREMIUM_ALL);
}

export const SUPER_MOUTH = "super-mouth";
export const PRICES = { premium: "$4.99", character: "$0.99", room: "$0.99", superMouth: "$0.99" } as const;

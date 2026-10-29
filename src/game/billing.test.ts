import { describe, expect, it } from "vitest";
import { UnavailableBilling } from "./billing";

describe("billing", () => {
  it("never reports a purchase as successful without a real store", async () => {
    for (const p of ["web", "android", "ios"] as const) {
      const b = new UnavailableBilling(p);
      const r = await b.purchase();
      expect(r.status).toBe("unavailable");
      expect(await b.verifiedEntitlements()).toEqual([]);
    }
  });
});

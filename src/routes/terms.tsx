import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, pageHead } from "@/components/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("/terms", "Terms of Use — Screambattle 2027", "The rules for playing Screambattle 2027, buying optional items and using the game safely."),
  component: () => (
    <InfoPage titleKey="termsTitle" sections={[[null, "tIntro"], ["tFreeH", "tFree"], ["tSafeH", "tSafe"], ["tFairH", "tFair"], ["tRefH", "tRef", true], ["tChgH", "tChg"]]} />
  ),
});

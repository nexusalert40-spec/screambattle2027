import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, pageHead } from "@/components/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("/privacy", "Privacy Policy — Screambattle 2027", "How Screambattle 2027 handles microphone sound, accounts, purchases, ads and your data."),
  component: () => (
    <InfoPage titleKey="privacyTitle" sections={[["pMicH", "pMic"], ["pAccH", "pAcc"], ["pSetH", "pSet"], ["pAdsH", "pAds"], ["pKidsH", "pKids"], ["pConH", "pCon", true]]} />
  ),
});

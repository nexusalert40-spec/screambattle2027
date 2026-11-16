import { Button } from "@/components/ui/button";
import buyButton from "@/assets/google-pay-buy.png.asset.json";
import payMark from "@/assets/google-pay-mark.png.asset.json";
import { detectPlatform } from "./billing";
import { useGame } from "./store";

/** Official, unmodified Google assets; never imply an unconfigured gateway can charge. */
export function GooglePayOption() {
  const { t } = useGame();
  if (detectPlatform() !== "web") return null;

  return (
    <section aria-label="Google Pay" className="my-4 flex flex-col gap-3 border-y border-border bg-card px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">{t("payWith")}</p>
        <img src={payMark.url} alt="Google Pay" width={752} height={400} className="h-10 w-auto shrink-0 object-contain" />
      </div>
      <Button
        variant="ghost"
        disabled
        aria-label="Google Pay"
        aria-description={t("gpaySoon")}
        title={t("gpaySoon")}
        className="h-auto min-h-12 w-full rounded-none p-0 disabled:opacity-100"
      >
        <img src={buyButton.url} alt="Buy with Google Pay" width={1200} height={192} className="block h-auto w-full" />
      </Button>
      <p className="text-center text-xs font-bold text-muted-foreground">{t("gpaySoon")}</p>
    </section>
  );
}
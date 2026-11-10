import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, MailForm, pageHead } from "@/components/InfoPage";

export const Route = createFileRoute("/report")({
  head: () => pageHead("/report", "Report a Problem — Screambattle 2027", "Report a bug, payment issue, inappropriate content or abuse in Screambattle 2027."),
  component: () => (
    <InfoPage titleKey="reportTitle" sections={[[null, "reportIntro"]]}><MailForm subject="Screambattle — Report" labelKey="reportLabel" /></InfoPage>
  ),
});

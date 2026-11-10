import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, MailForm, pageHead } from "@/components/InfoPage";

export const Route = createFileRoute("/contact")({
  head: () => pageHead("/contact", "Contact Us — Screambattle 2027", "Send questions, ideas or feedback to the Screambattle 2027 team by email."),
  component: () => (
    <InfoPage titleKey="contactTitle" sections={[[null, "contactIntro"]]}><MailForm subject="Screambattle — Contact" labelKey="contactLabel" /></InfoPage>
  ),
});

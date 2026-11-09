import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, MailForm, pageHead } from "@/components/InfoPage";

export const Route = createFileRoute("/contact")({
  head: () => pageHead("/contact", "Contact Us — Screambattle 2027", "Send questions, ideas or feedback to the Screambattle 2027 team by email."),
  component: () => (
    <InfoPage title="Contact Us" arTitle="اتصل بنا">
      <p>Questions, ideas or problems? Write to us and we will reply by email.</p>
      <p dir="rtl">لديك سؤال أو اقتراح أو مشكلة؟ راسلنا وسنرد عليك عبر البريد.</p>
      <MailForm subject="Screambattle — Contact" label="Your message · رسالتك" />
    </InfoPage>
  ),
});

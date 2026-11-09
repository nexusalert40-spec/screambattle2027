import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, MailForm, pageHead } from "@/components/InfoPage";

export const Route = createFileRoute("/report")({
  head: () => pageHead("/report", "Report a Problem — Screambattle 2027", "Report a bug, payment issue, inappropriate content or abuse in Screambattle 2027."),
  component: () => (
    <InfoPage title="Report a Problem" arTitle="الإبلاغ عن مشكلة">
      <p>Report bugs, payment problems, inappropriate content or abuse. Please describe what happened, on which device, and when.</p>
      <p dir="rtl">أبلغ عن خطأ أو مشكلة دفع أو محتوى غير لائق أو إساءة. صف ما حدث ونوع الجهاز والوقت.</p>
      <MailForm subject="Screambattle — Report" label="Describe the problem · صف المشكلة" />
    </InfoPage>
  ),
});

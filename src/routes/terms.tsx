import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, InfoPage, pageHead } from "@/components/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("/terms", "Terms of Use — Screambattle 2027", "The rules for playing Screambattle 2027, buying optional items and using the game safely."),
  component: () => (
    <InfoPage title="Terms of Use" arTitle="شروط الاستخدام">
      <p>By playing Screambattle 2027 you agree to these terms.</p>
      <p dir="rtl">باستخدامك للعبة Screambattle 2027 فإنك توافق على هذه الشروط.</p>
      <h2>Free to play · مجانية</h2>
      <p>The main game is free. Optional items (characters, meters, rooms, Super Mouth, Premium) are one-time purchases linked to your account.</p>
      <h2>Play safely · العب بأمان</h2>
      <p>Shout responsibly: take breaks, keep a safe distance from others and do not disturb people around you.</p>
      <h2>Fair use · الاستخدام العادل</h2>
      <p>Do not cheat, abuse, copy or resell the game or its characters. We may suspend accounts that break these rules.</p>
      <h2>Refunds · الاسترداد</h2>
      <p>For a purchase problem, contact us within 14 days at <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      <h2>Changes · التعديلات</h2>
      <p>We may update the game and these terms. The game is provided as is.</p>
    </InfoPage>
  ),
});

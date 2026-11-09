import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, InfoPage, pageHead } from "@/components/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("/privacy", "Privacy Policy — Screambattle 2027", "How Screambattle 2027 handles microphone sound, accounts, purchases, ads and your data."),
  component: () => (
    <InfoPage title="Privacy Policy" arTitle="سياسة الخصوصية">
      <h2>Microphone · الميكروفون</h2>
      <p>The game uses your microphone only during a round, after you tap to start and allow access. Loudness is measured on your device; audio is never recorded, saved or uploaded.</p>
      <p dir="rtl">يُستخدم الميكروفون فقط أثناء الجولة بعد موافقتك. يُقاس مستوى الصوت على جهازك ولا يُسجَّل الصوت ولا يُحفظ ولا يُرسل.</p>
      <h2>Accounts and purchases · الحسابات والمشتريات</h2>
      <p>No account is needed to play. If you buy an item, we store your email and your purchase record so your unlocks stay with your account on any device. Payments are processed by the payment provider; we never see your card details.</p>
      <p dir="rtl">لا يلزم حساب للعب. عند الشراء نحفظ بريدك وسجل الشراء لتبقى مشترياتك مرتبطة بحسابك. تتم المعالجة لدى مزود الدفع ولا نطّلع على بيانات بطاقتك.</p>
      <h2>Settings · الإعدادات</h2>
      <p>Language, sound and character choices are saved on your device only.</p>
      <h2>Ads and analytics · الإعلانات والتحليلات</h2>
      <p>The website may show ads from Google AdSense, which can use cookies to show relevant ads. You can manage this in your Google ad settings.</p>
      <h2>Children · الأطفال</h2>
      <p>Children should play with a parent's permission, and purchases must be made by an adult.</p>
      <h2>Contact · التواصل</h2>
      <p>To ask about or delete your data, email <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </InfoPage>
  ),
});

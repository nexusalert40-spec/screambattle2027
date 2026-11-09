import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const CONTACT_EMAIL = "screambattle050@gmail.com";

export function pageHead(path: string, title: string, description: string) {
  const url = `https://screambattle.fun${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function SiteLinks() {
  const cls = "underline-offset-2 hover:underline";
  return (
    <nav aria-label="Site" className="flex flex-wrap justify-center gap-x-4 gap-y-1 py-4 text-sm text-muted-foreground">
      <Link to="/contact" className={cls}>Contact us · اتصل بنا</Link>
      <Link to="/privacy" className={cls}>Privacy · الخصوصية</Link>
      <Link to="/terms" className={cls}>Terms · الشروط</Link>
      <Link to="/report" className={cls}>Report · الإبلاغ</Link>
    </nav>
  );
}

export function InfoPage({ title, arTitle, children }: { title: string; arTitle: string; children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-background px-5 py-8 text-foreground">
      <Link to="/" className="text-sm font-bold text-primary">← Screambattle</Link>
      <h1 className="mt-4 text-3xl font-black">{title}</h1>
      <p className="mb-6 text-xl font-bold text-muted-foreground" dir="rtl">{arTitle}</p>
      <div className="space-y-4 leading-relaxed [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold">{children}</div>
      <SiteLinks />
    </main>
  );
}

export function MailForm({ subject, label }: { subject: string; label: string }) {
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const body = `${String(f.get("message") ?? "").slice(0, 3000)}\n\nFrom: ${String(f.get("email") ?? "").slice(0, 200)}`;
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }}
    >
      <input name="email" type="email" required maxLength={200} placeholder="Your email · بريدك" className="w-full rounded-xl border-2 border-border bg-card p-3" />
      <textarea name="message" required maxLength={3000} rows={6} placeholder={label} className="w-full rounded-xl border-2 border-border bg-card p-3" />
      <button className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Send · إرسال</button>
      <p className="text-sm text-muted-foreground">Or email us directly: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
    </form>
  );
}

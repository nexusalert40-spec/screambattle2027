import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useSiteText, type SiteKey } from "@/game/siteText";

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
  const { t, dir } = useSiteText();
  const cls = "underline-offset-2 hover:underline";
  return (
    <nav aria-label="Site" dir={dir} className="flex flex-wrap justify-center gap-x-4 gap-y-1 py-4 text-sm text-muted-foreground">
      <Link to="/contact" className={cls}>{t("navContact")}</Link>
      <Link to="/privacy" className={cls}>{t("navPrivacy")}</Link>
      <Link to="/terms" className={cls}>{t("navTerms")}</Link>
      <Link to="/report" className={cls}>{t("navReport")}</Link>
    </nav>
  );
}

const Mail = () => <a className="underline" dir="ltr" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

/** Sections: [heading key | null, text key, append email?] */
export function InfoPage({ titleKey, sections, children }: { titleKey: SiteKey; sections: [SiteKey | null, SiteKey, boolean?][]; children?: ReactNode }) {
  const { t, dir, lang } = useSiteText();
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = dir; }, [lang, dir]);
  return (
    <main dir={dir} className="mx-auto min-h-screen max-w-2xl bg-background px-5 py-8 text-foreground">
      <Link to="/" className="text-sm font-bold text-primary">{t("back")}</Link>
      <h1 className="mb-6 mt-4 text-3xl font-black">{t(titleKey)}</h1>
      <div className="space-y-4 leading-relaxed [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold">
        {sections.map(([h, p, mail]) => (
          <section key={p}>
            {h && <h2>{t(h)}</h2>}
            <p>{t(p)}{mail && <> <Mail />.</>}</p>
          </section>
        ))}
        {children}
      </div>
      <SiteLinks />
    </main>
  );
}

export function MailForm({ subject, labelKey }: { subject: string; labelKey: SiteKey }) {
  const { t } = useSiteText();
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const body = `${String(f.get("message") ?? "").slice(0, 3000)}\n\n${t("formFrom")}: ${String(f.get("email") ?? "").slice(0, 200)}`;
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }}
    >
      <input name="email" type="email" required maxLength={200} placeholder={t("formEmail")} className="w-full rounded-xl border-2 border-border bg-card p-3" />
      <textarea name="message" required maxLength={3000} rows={6} placeholder={t(labelKey)} className="w-full rounded-xl border-2 border-border bg-card p-3" />
      <button className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">{t("formSend")}</button>
      <p className="text-sm text-muted-foreground">{t("formDirect")} <Mail /></p>
    </form>
  );
}

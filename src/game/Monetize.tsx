import { useEffect, useState, type ReactNode } from "react";
import { Ban, Bitcoin, Check, Copy, Crown, DoorOpen, Gauge, Heart, Lock, Volume2, X } from "lucide-react";
import QRCode from "qrcode";
import superMouth from "@/assets/super-mouth.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useGame } from "./store";
import { CHARACTERS, themeBg, characterName, getChar, isOwned, PREMIUM_ALL, type Character } from "./characters";
import { ROOMS, isRoomOwned, PRICES, SUPER_MOUTH, type Reaction, type Room } from "./rooms";
import { METERS, FREE_METER, isMeterOwned, meterEntitlement, priceCents, formatUsd } from "./catalog";
import { Meter } from "./Meters";
import { Avatar, CharTile, GameButton, Screen } from "./ui";
import { applause, say, sfx } from "./sfx";
import { capturePaypalOrder, createPaypalOrder } from "./payments.functions";
import { detectPlatform } from "./billing";

/* ---------- Pay-to-register checkout ---------- */
export interface CheckoutItem { id: string; name: string; price: string }
const PENDING_KEY = "scream-pending-checkout";
const ORDER_KEY = "scream-paypal-order";

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const { t } = useGame();
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-3 sm:items-center">
      <div className="card-game anim-popin max-h-[90dvh] w-full max-w-md overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-display text-2xl leading-tight">{title}</p>
          <button aria-label={t("close")} onClick={onClose} className="btn-game bg-card grid size-10 shrink-0 place-items-center rounded-full"><X className="size-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Sign-up is only asked for when someone taps Buy; the game itself never needs an account. */
function AuthStep() {
  const { t } = useGame();
  const [mode, setMode] = useState<"up" | "in">("up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    const res = mode === "up"
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (res.error) { setMsg(res.error.message); return; }
    if (mode === "up" && !res.data.session) { setMsg(t("checkEmail")); setMode("in"); }
  };
  const google = async () => {
    setMsg(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setMsg(t("authError"));
  };
  return (
    <div>
      <p className="mb-3 font-bold text-muted-foreground">{t("signUpBody")}</p>
      <button onClick={google} className="btn-game flex w-full items-center justify-center gap-2 bg-card py-3 text-lg"><span className="font-sans font-black">G</span>{t("orGoogle")}</button>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
        <label className="font-bold">{t("email")}<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-2xl border-[3px] border-ink bg-card px-3 py-2 font-sans" /></label>
        <label className="font-bold">{t("password")}<input type="password" required minLength={6} autoComplete={mode === "up" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-2xl border-[3px] border-ink bg-card px-3 py-2 font-sans" /></label>
        <button type="submit" disabled={busy} className="btn-game bg-sun-grad mt-1 w-full py-3 font-display text-xl">{mode === "up" ? t("createAccount") : t("signIn")}</button>
      </form>
      <button onClick={() => setMode(mode === "up" ? "in" : "up")} className="mt-3 w-full text-center text-sm font-bold underline">{mode === "up" ? t("haveAccount") : t("needAccount")}</button>
      {msg && <p role="status" className="mt-3 rounded-2xl bg-muted p-3 text-sm font-bold">{msg}</p>}
    </div>
  );
}

function PayStep({ item }: { item: CheckoutItem }) {
  const g = useGame();
  const { t } = g;
  const [state, setState] = useState<"idle" | "busy" | "waiting" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const native = detectPlatform() !== "web";
  const start = async () => {
    setState("busy"); setErr(null);
    try {
      const { orderId, approveUrl } = await createPaypalOrder({ data: { productId: item.id } });
      sessionStorage.setItem(ORDER_KEY, orderId);
      window.open(approveUrl, "_blank", "noopener");
      setState("waiting");
    } catch (e) { setErr(e instanceof Error ? e.message : t("authError")); setState("error"); }
  };
  const check = async () => {
    const orderId = sessionStorage.getItem(ORDER_KEY);
    if (!orderId) return;
    setState("busy");
    try {
      const r = await capturePaypalOrder({ data: { orderId } });
      if (r.status === "completed") { sessionStorage.removeItem(ORDER_KEY); await g.refreshEntitlements(); applause(g.sound); setState("done"); }
      else setState("waiting");
    } catch (e) { setErr(e instanceof Error ? e.message : t("payFailed")); setState("error"); }
  };
  if (state === "done") return <p className="rounded-2xl bg-muted p-3 font-bold"><Check className="me-1 inline size-5" />{t("payVerified")}</p>;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold text-muted-foreground">{t("signedInAs")} {g.user?.email}</p>
      <p className="text-sm font-bold text-muted-foreground">{t("payWith")}</p>
      {native ? <p className="rounded-2xl bg-muted p-3 text-sm font-bold">{t("payNative")}</p> : state === "waiting" ? (
        <>
          <p className="rounded-2xl bg-muted p-3 text-sm font-bold">{t("paypalWaiting")}</p>
          <GameButton onClick={check} className="w-full py-3 text-lg">{t("paypalCheck")}</GameButton>
        </>
      ) : (
        <button onClick={start} disabled={state === "busy"} className="btn-game flex items-center justify-center gap-2 bg-sun-grad py-3 text-lg">{t("payPayPalGo")}</button>
      )}
      <button disabled aria-disabled className="btn-game flex cursor-not-allowed items-center justify-center gap-2 bg-ink py-3 text-lg text-card opacity-60">
        <span className="font-sans font-black">G</span> {t("gpaySoon")}
      </button>
      {err && <p role="alert" className="rounded-2xl bg-muted p-3 text-sm font-bold">{err}</p>}
    </div>
  );
}

function Checkout({ item, onClose }: { item: CheckoutItem; onClose: () => void }) {
  const g = useGame();
  return (
    <Sheet title={g.user ? item.name : g.t("signUpTitle")} onClose={onClose}>
      <p className="mb-4 inline-block rounded-full border-2 border-ink bg-sun px-3 py-1 font-display text-xl">{item.name} · {item.price}</p>
      {g.user ? <PayStep item={item} /> : <AuthStep />}
    </Sheet>
  );
}

function useCheckout() {
  const [item, setItem] = useState<CheckoutItem | null>(null);
  // Remember the item across a Google sign-in redirect so checkout resumes afterwards.
  useEffect(() => {
    try { const raw = sessionStorage.getItem(PENDING_KEY); if (raw) setItem(JSON.parse(raw) as CheckoutItem); } catch {}
  }, []);
  const open = (i: CheckoutItem | null) => {
    try { i ? sessionStorage.setItem(PENDING_KEY, JSON.stringify(i)) : sessionStorage.removeItem(PENDING_KEY); } catch {}
    setItem(i);
  };
  const sheet = item ? <Checkout item={item} onClose={() => open(null)} /> : null;
  return { open, sheet };
}

/** PayPal sends the buyer back to "/?paypal=return&token=ORDER"; verify it on the server and unlock. */
export function PaypalReturn() {
  const g = useGame();
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const token = q.get("token");
    if (!q.get("paypal")) return;
    window.history.replaceState(null, "", window.location.pathname);
    if (q.get("paypal") !== "return" || !token) return;
    void capturePaypalOrder({ data: { orderId: token } })
      .then(async (r) => { if (r.status === "completed") { await g.refreshEntitlements(); applause(g.sound); setMsg(g.t("payVerified")); } else setMsg(g.t("paypalWaiting")); })
      .catch(() => setMsg(g.t("payFailed")));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return msg ? <Sheet title={g.t("shop")} onClose={() => setMsg(null)}><p className="font-bold">{msg}</p></Sheet> : null;
}

/* ---------- Bitcoin donation (never unlocks anything) ---------- */
const BTC_ADDRESS = "bc1q368d2erhav6qzh7pwv7evtju66jea7d3r7qtae";
function DonateCard() {
  const { t } = useGame();
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { void QRCode.toDataURL(`bitcoin:${BTC_ADDRESS}`, { margin: 1, width: 220 }).then(setQr); }, []);
  const copy = async () => { try { await navigator.clipboard.writeText(BTC_ADDRESS); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} };
  return (
    <div className="card-game mt-6 p-4">
      <p className="flex items-center gap-2 font-display text-xl"><Heart className="size-5" />{t("donateTitle")}</p>
      <p className="mt-1 text-xs font-bold text-muted-foreground">{t("donateBody")}</p>
      <div className="mt-3 flex items-center gap-3">
        {qr ? <img src={qr} alt="Bitcoin QR" width={110} height={110} className="size-28 rounded-xl border-2 border-ink" /> : <div className="size-28 rounded-xl bg-muted" />}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs font-bold"><Bitcoin className="size-4" />BTC</p>
          <p className="break-all font-mono text-xs" dir="ltr">{BTC_ADDRESS}</p>
          <button onClick={copy} className="btn-game mt-2 flex items-center gap-1 bg-card px-3 py-1 text-sm"><Copy className="size-4" />{copied ? t("copied") : t("copy")}</button>
        </div>
      </div>
    </div>
  );
}

function PriceButton({ price, onClick }: { price: string; onClick: () => void }) {
  return <button onClick={onClick} className="btn-game bg-sun-grad px-3 py-1 font-display text-sm">{price}</button>;
}

/* ---------- Gender onboarding ---------- */
export function GenderModal() {
  const g = useGame();
  if (g.gender) return null;
  const pick = (gender: "boy" | "girl") => { sfx.tap(g.sound); g.set({ gender, charId: gender === "boy" ? "ali" : "aicha", roomId: gender === "boy" ? "ali" : "aicha" }); };
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="gender-title" className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4">
      <div className="card-game anim-popin w-full max-w-sm p-5 text-center">
        <h2 id="gender-title" className="font-display text-3xl">{g.t("genderTitle")}</h2>
        <p className="mb-4 font-bold text-muted-foreground">{g.t("genderBody")}</p>
        <div className="grid grid-cols-2 gap-3">
          {([["boy", "ali", "bg-ali-grad"], ["girl", "aicha", "bg-aicha-grad"]] as const).map(([k, cid, bg]) => (
            <button key={k} onClick={() => pick(k)} className={`btn-game ${bg} flex flex-col items-center rounded-3xl p-3`}>
              <img src={getChar(cid).image} alt="" width={1024} height={1024} className="size-28 object-contain" />
              <span className="title-white text-3xl">{g.t(k)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Super Mouth badge (game interface) ---------- */
export function SuperMouthBadge({ onOpen }: { onOpen: () => void }) {
  const g = useGame();
  const owned = g.entitlements.includes(SUPER_MOUTH) || g.entitlements.includes(PREMIUM_ALL);
  return (
    <button onClick={onOpen} className="card-game mt-4 flex w-full items-center gap-3 p-2 text-start">
      <img src={superMouth} alt="" width={816} height={816} loading="lazy" className="size-14 object-contain" />
      <div className="min-w-0 flex-1"><p className="font-display text-lg leading-tight">{g.t("superMouth")}</p><p className="text-xs font-semibold text-muted-foreground">{g.t("superMouthDesc")}</p></div>
      {owned ? <Check className="size-6 text-ali" /> : <Lock className="size-6 shrink-0" />}
    </button>
  );
}

/* ---------- Premium screen ---------- */
export function PremiumScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const co = useCheckout();
  const perks: [typeof Crown, string][] = [[Crown, g.t("premiumChars")], [Gauge, `10 ${g.t("tabMeters")}`], [DoorOpen, g.t("premiumRooms")], [Ban, g.t("premiumNoAds")]];
  return (
    <Screen title={g.t("goPremium")} onBack={onBack}>
      <div className="bg-grape-grad relative overflow-hidden rounded-3xl border-[3px] border-ink p-4 text-center">
        <div className="flex justify-center -space-x-6 rtl:space-x-reverse">
          {CHARACTERS.slice(3, 8).map((c) => <img key={c.id} src={c.image} alt="" loading="lazy" className="size-16 object-contain" />)}
        </div>
        <p className="title-pop mt-2 text-4xl">{g.t("premiumTitle")}</p>
        <p className="title-white text-lg">{g.t("premiumBody")}</p>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {perks.map(([I, l]) => <li key={l} className="card-game flex items-center gap-3 p-3 font-display text-lg"><span className="bg-sun-grad grid size-10 place-items-center rounded-full border-2 border-ink"><I className="size-5" /></span>{l}</li>)}
      </ul>
      {g.entitlements.includes(PREMIUM_ALL)
        ? <p className="title-white mt-5 text-center text-2xl">{g.t("owned")}</p>
        : <GameButton className="mt-5 w-full py-4 text-3xl" onClick={() => co.open({ id: PREMIUM_ALL, name: g.t("premiumTitle"), price: PRICES.premium })}>{g.t("unlockAll")} · {PRICES.premium}</GameButton>}
      {co.sheet}
    </Screen>
  );
}

/* ---------- Shop ---------- */
type Tab = "chars" | "meters" | "rooms" | "items";
export function Shop({ onBack, onPremium }: { onBack: () => void; onPremium: () => void }) {
  const g = useGame();
  const co = useCheckout();
  const [tab, setTab] = useState<Tab>("chars");
  const packs = [
    { id: "scream-effects", name: g.t("packFx"), desc: g.t("packFxDesc"), price: "$0.99", icon: Volume2, tone: "bg-aicha-grad" },
    { id: "advanced-meters", name: g.t("packMeters"), desc: g.t("packMetersDesc"), price: "$1.99", icon: Gauge, tone: "bg-turq-grad" },
  ] as const;
  const tabs: [Tab, string][] = [["chars", g.t("tabChars")], ["meters", g.t("tabMeters")], ["rooms", g.t("tabRooms")], ["items", g.t("tabItems")]];
  return (
    <Screen title={g.t("shop")} onBack={onBack}>
      <button onClick={onPremium} className="btn-game bg-grape-grad mb-4 flex items-center gap-3 rounded-3xl p-3 text-start">
        <Crown className="size-10 shrink-0" />
        <span className="min-w-0 flex-1"><span className="title-white block text-2xl leading-tight">{g.t("goPremium")}</span><span className="block text-xs font-bold text-card">{g.t("premiumChars")} · {g.t("premiumRooms")} · {g.t("premiumNoAds")}</span></span>
        <span className="rounded-full border-2 border-ink bg-sun px-2 py-0.5 font-display">{PRICES.premium}</span>
      </button>
      <div role="tablist" className="mb-4 grid grid-cols-4 gap-1.5">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`btn-game min-w-0 truncate px-1 py-2 text-sm ${tab === k ? "bg-sun-grad" : "bg-card"}`}>{l}</button>
        ))}
      </div>
      {tab === "chars" && (
        <div className="grid grid-cols-2 gap-3">
          {CHARACTERS.filter((c) => c.tier === "premium").map((c) => (
            <CharTile key={c.id} c={c}>
              <img src={c.image} alt={c.name.en} loading="lazy" className="aspect-square w-full object-contain p-2" />
              <div className="flex items-center justify-between gap-1 px-2 pb-2">
                <p className="title-white truncate text-sm">{characterName(c, g.lang)}</p>
                {isOwned(c, g.entitlements) ? <Check className="size-5" /> : <PriceButton price={PRICES.character} onClick={() => co.open({ id: c.id, name: characterName(c, g.lang), price: PRICES.character })} />}
              </div>
            </CharTile>
          ))}
        </div>
      )}
      {tab === "meters" && (
        <div className="grid grid-cols-2 gap-3">
          {METERS.filter((m) => m !== FREE_METER).map((m) => {
            const name = g.t(`m_${m}` as "m_fire");
            const price = formatUsd(priceCents(meterEntitlement(m)) ?? 99);
            return (
              <div key={m} className="card-game p-2">
                <Meter style={m} value={72} peak={88} />
                <div className="mt-2 flex items-center justify-between gap-1">
                  <p className="truncate font-display text-sm">{name}</p>
                  {isMeterOwned(m, g.entitlements) ? <Check className="size-5" /> : <PriceButton price={price} onClick={() => co.open({ id: meterEntitlement(m), name, price })} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {tab === "rooms" && (
        <div className="flex flex-col gap-3">
          {ROOMS.map((r) => {
            const c = getChar(r.charId);
            const own = isRoomOwned(r, c, g.entitlements);
            return (
              <Row key={r.id} icon={<RoomThumb room={r} c={c} />} title={`${characterName(c, g.lang)} · ${g.t("rooms")}`} desc={r.items.map((i) => i.emoji).join(" ")}>
                {own ? <span className="text-xs font-bold">{g.t(c.tier === "free" ? "free" : "owned")}</span> : <PriceButton price={PRICES.room} onClick={() => co.open({ id: `room:${r.id}`, name: `${characterName(c, g.lang)} · ${g.t("rooms")}`, price: PRICES.room })} />}
              </Row>
            );
          })}
        </div>
      )}
      {tab === "items" && (
        <div className="flex flex-col gap-3">
          <Row icon={<img src={superMouth} alt="" loading="lazy" className="size-14 object-contain" />} title={g.t("superMouth")} desc={g.t("superMouthDesc")}>
            <PriceButton price={PRICES.superMouth} onClick={() => co.open({ id: SUPER_MOUTH, name: g.t("superMouth"), price: PRICES.superMouth })} />
          </Row>
          {packs.map((p) => (
            <Row key={p.id} icon={<span className={`btn-game ${p.tone} grid size-14 place-items-center rounded-2xl`}><p.icon className="size-7 text-ink" /></span>} title={p.name} desc={p.desc}>
              <PriceButton price={p.price} onClick={() => co.open({ id: p.id, name: p.name, price: p.price })} />
            </Row>
          ))}
        </div>
      )}
      <DonateCard />
      {co.sheet}
    </Screen>
  );
}

function Row({ icon, title, desc, children }: { icon: ReactNode; title: string; desc: string; children: ReactNode }) {
  return (
    <div className="card-game flex items-center gap-3 p-3">
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0 flex-1"><p className="font-display text-lg leading-tight">{title}</p><p className="text-xs font-semibold text-muted-foreground">{desc}</p></div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function RoomThumb({ room, c }: { room: Room; c: Character }) {
  return <span className={`${themeBg[c.theme]} relative grid size-14 place-items-center overflow-hidden rounded-2xl border-[3px] border-ink`}><img src={c.image} alt="" loading="lazy" className="size-12 object-contain" /><span className="absolute end-0.5 top-0 text-sm">{room.window}</span></span>;
}

/* ---------- Interactive Screaming Rooms ---------- */
const REACT_CLASS: Record<Reaction, string> = { bounce: "anim-dance", spin: "anim-spin", shake: "anim-shake", pop: "anim-popin" };

export function Rooms({ onBack, onShop }: { onBack: () => void; onShop: () => void }) {
  const g = useGame();
  const [roomId, setRoomId] = useState(g.roomId);
  const room = ROOMS.find((r) => r.id === roomId) ?? ROOMS[0]!;
  const c = getChar(room.charId);
  const own = isRoomOwned(room, c, g.entitlements);
  const [active, setActive] = useState<number | null>(null);
  const [shout, setShout] = useState(false);
  const poke = (i: number) => { sfx.tap(g.sound); setActive(i); setTimeout(() => setActive((a) => (a === i ? null : a)), 900); };
  const tapChar = () => { const k = (["cheerGo", "cheerChamp", "cheerBravo"] as const)[Math.floor(Math.random() * 3)]!; if (k === "cheerBravo") applause(g.sound); say(g.sound, g.t(k), g.lang); setShout(true); setTimeout(() => setShout(false), 900); };
  return (
    <Screen title={g.t("rooms")} onBack={onBack}>
      {/* Scene: wall, window, shelf, floor, character, tappable props */}
      <div className={`${themeBg[c.theme]} relative aspect-[3/4] w-full overflow-hidden rounded-3xl border-[3px] border-ink`}>
        <div className="absolute inset-x-0 bottom-0 h-[30%] border-t-[3px] border-ink bg-card/70" />
        <div className="absolute inset-x-[30%] bottom-[24%] h-[8%] rounded-[50%] bg-ink/20" />
        <div className="absolute start-[6%] top-[8%] grid size-[24%] place-items-center rounded-2xl border-[3px] border-ink bg-card/80 text-4xl">{room.window}</div>
        <div className="absolute end-[6%] top-[42%] h-2 w-[28%] rounded-full border-2 border-ink bg-card" />
        {room.items.map((it, i) => (
          <button key={i} aria-label={it.emoji} onClick={() => own && poke(i)} disabled={!own}
            className={`absolute -translate-x-1/2 -translate-y-1/2 leading-none drop-shadow-[0_3px_0_var(--ink)] ${active === i ? REACT_CLASS[it.react] : ""}`}
            style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: it.size }}>
            {it.emoji}
          </button>
        ))}
        <button onClick={tapChar} aria-label={g.t("tapToPlay")} className="absolute bottom-[8%] left-1/2 -translate-x-1/2">
          <Avatar c={c} size={190} shouting={shout} anim={shout ? "anim-shake" : "anim-bob"} />
        </button>
        {!own && (
          <div className="absolute inset-0 grid place-items-center bg-ink/50 p-6 text-center">
            <div className="card-game p-4"><Lock className="mx-auto mb-1 size-8" /><p className="font-display text-xl">{g.t("roomLocked")}</p>
              <GameButton className="mt-3 text-base" onClick={onShop}>{g.t("shop")}</GameButton></div>
          </div>
        )}
        {own && <p className="title-white absolute inset-x-0 top-2 text-center text-sm">{g.t("roomsHint")}</p>}
      </div>
      <div className="my-3">
        <GameButton className="w-full" disabled={!own || g.roomId === room.id} onClick={() => g.set({ roomId: room.id })}>
          {g.roomId === room.id ? g.t("inUse") : g.t("useRoom")}
        </GameButton>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {ROOMS.map((r) => {
          const rc = getChar(r.charId);
          return (
            <button key={r.id} onClick={() => setRoomId(r.id)} className={`relative shrink-0 transition-transform ${r.id === roomId ? "scale-110" : ""}`}>
              <RoomThumb room={r} c={rc} />
              {!isRoomOwned(r, rc, g.entitlements) && <Lock className="absolute bottom-0.5 end-0.5 size-4 rounded-full bg-card p-0.5" />}
            </button>
          );
        })}
      </div>
    </Screen>
  );
}

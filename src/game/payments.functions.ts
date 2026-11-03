import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { formatUsd, priceCents } from "./catalog";

/* PayPal Orders v2. Credentials stay on the server; nothing unlocks until a capture is verified here. */
async function paypal() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal is not configured yet.");
  const env = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
  const base = env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${id}:${secret}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal sign-in failed (${res.status}).`);
  const { access_token } = (await res.json()) as { access_token: string };
  const call = async (path: string, init?: RequestInit) => {
    const r = await fetch(`${base}${path}`, { ...init, headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json", ...(init?.headers ?? {}) } });
    const body = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: r.ok, status: r.status, body };
  };
  return { env, call };
}

export const createPaypalOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ productId: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data, context }) => {
    const cents = priceCents(data.productId);
    if (cents == null) throw new Error("This item is not for sale.");
    const origin = getRequestHeader("origin");
    if (!origin || !/^https?:\/\//.test(origin)) throw new Error("Unknown site address.");
    const { call } = await paypal();
    const r = await call("/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ reference_id: data.productId, custom_id: `${context.userId}|${data.productId}`, description: `Scream Battle: ${data.productId}`, amount: { currency_code: "USD", value: formatUsd(cents).slice(1) } }],
        application_context: { brand_name: "Scream Battle", user_action: "PAY_NOW", shipping_preference: "NO_SHIPPING", return_url: `${origin}/?paypal=return`, cancel_url: `${origin}/?paypal=cancel` },
      }),
    });
    if (!r.ok) throw new Error(`PayPal could not start the payment (${r.status}).`);
    const links = (r.body.links as { rel: string; href: string }[] | undefined) ?? [];
    const approve = links.find((l) => l.rel === "approve" || l.rel === "payer-action")?.href;
    if (!approve) throw new Error("PayPal did not return a checkout link.");
    return { orderId: r.body.id as string, approveUrl: approve };
  });

type Capture = { id: string; status: string; amount: { currency_code: string; value: string } };
type Unit = { custom_id?: string; payments?: { captures?: Capture[] } };

export const capturePaypalOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ orderId: z.string().regex(/^[A-Z0-9]{5,40}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const { env, call } = await paypal();
    let order = await call(`/v2/checkout/orders/${data.orderId}`);
    if (!order.ok) throw new Error("Payment not found.");
    if (order.body.status === "APPROVED") {
      const cap = await call(`/v2/checkout/orders/${data.orderId}/capture`, { method: "POST", body: "{}" });
      if (cap.ok) order = cap;
      else order = await call(`/v2/checkout/orders/${data.orderId}`);
    }
    if (order.body.status !== "COMPLETED") return { status: "pending" as const };
    const unit = ((order.body.purchase_units as Unit[] | undefined) ?? [])[0];
    const [uid, productId] = (unit?.custom_id ?? "").split("|");
    if (uid !== context.userId || !productId) throw new Error("This payment belongs to another account.");
    const capture = unit?.payments?.captures?.[0];
    const cents = priceCents(productId);
    if (!capture || capture.status !== "COMPLETED" || cents == null || capture.amount.currency_code !== "USD" || Math.round(Number(capture.amount.value) * 100) !== cents) {
      throw new Error("Payment could not be verified.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("purchases").upsert(
      { user_id: context.userId, product_id: productId, provider: "paypal", provider_order_id: data.orderId, amount: cents / 100, currency: "USD", environment: env },
      { onConflict: "provider_order_id", ignoreDuplicates: true },
    );
    if (error) throw new Error("Could not save the purchase.");
    return { status: "completed" as const, productId };
  });

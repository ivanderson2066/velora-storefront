import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalizeId(raw: string): string {
  return raw.replace(/^local-variant-/, "").replace(/^local-/, "");
}

const RequestSchema = z.object({
  productId: z.string().uuid().optional(),
  items: z.array(z.object({ productId: z.string().min(1).max(100), quantity: z.number().int().min(1).max(20) })).min(1).max(50).optional(),
  locale: z.enum(["en", "pt"]).optional(),
}).refine((value) => value.productId || value.items?.length, { message: "No items provided" });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const parsed = RequestSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid checkout request", details: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { productId, items, locale } = parsed.data;

    const requested: Array<{ id: string; quantity: number }> = [];
    if (Array.isArray(items) && items.length > 0) {
      for (const it of items) {
        if (it?.productId && it.quantity > 0) {
          requested.push({ id: normalizeId(it.productId), quantity: it.quantity });
        }
      }
    } else if (productId) {
      requested.push({ id: normalizeId(productId), quantity: 1 });
    }

    if (requested.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const backendUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!backendUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Checkout service unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(backendUrl, serviceKey);

    const ids = requested.map((r) => r.id);
    const { data: products, error } = await supabase
      .from("products")
      .select("id,name,description,price_cents,currency,image_url,active")
      .in("id", ids)
      .eq("active", true);

    const uniqueIds = [...new Set(ids)];
    if (error || !products || products.length !== uniqueIds.length) {
      return new Response(JSON.stringify({ error: "Products not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
    const origin = req.headers.get("origin") ?? "https://example.com";

    const currencies = new Set(products.map((product) => product.currency.toLowerCase()));
    if (currencies.size !== 1) {
      return new Response(JSON.stringify({ error: "All checkout items must use the same currency" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    const line_items = requested
      .map((r) => {
        const p = productMap.get(r.id);
        if (!p) return null;
        return {
          price_data: {
            currency: (p.currency || "usd").toLowerCase(),
            product_data: {
              name: p.name,
              description: p.description ?? undefined,
              images: p.image_url ? [p.image_url] : undefined,
            },
            unit_amount: p.price_cents,
          },
          quantity: r.quantity,
        };
      })
      .filter((x): x is NonNullable<typeof x> => !!x);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      locale: locale === "pt" ? "pt-BR" : "en",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: {
        items: JSON.stringify(
          requested.map((r) => ({ product_id: r.id, quantity: r.quantity })),
        ),
      },
    });

    const { error: orderError } = await supabase.from("orders").upsert({
      stripe_session_id: session.id,
      amount_total: session.amount_total ?? line_items.reduce((sum, item) => sum + item.price_data.unit_amount * item.quantity, 0),
      currency: session.currency ?? products[0].currency ?? "usd",
      status: "pending",
      items: requested.map((item) => ({ product_id: item.id, quantity: item.quantity })),
    }, { onConflict: "stripe_session_id" });
    if (orderError) console.error("Failed to record pending order", orderError);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-checkout error", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

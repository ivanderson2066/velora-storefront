import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalizeId(raw: string): string {
  return raw.replace(/^local-/, "").replace(/^local-variant-/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { productId, items, locale } = body as {
      productId?: string;
      items?: Array<{ productId: string; quantity: number }>;
      locale?: string;
    };

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const ids = requested.map((r) => r.id);
    const { data: products, error } = await supabase
      .from("products")
      .select("id,name,description,price_cents,currency,image_url,active")
      .in("id", ids)
      .eq("active", true);

    if (error || !products || products.length === 0) {
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

    const currency = (products[0].currency || "usd").toLowerCase();
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

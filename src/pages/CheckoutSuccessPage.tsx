import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n";
import { useCartStore } from "@/stores/cartStore";
import { CheckCircle2, Package, Mail, ArrowRight, Sparkles } from "lucide-react";

export default function CheckoutSuccessPage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const clearCart = useCartStore((s) => s.clearCart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    clearCart();
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [clearCart]);

  return (
    <>
      <Helmet>
        <title>Thank You · MyxelHome</title>
        <meta name="description" content="Your order has been confirmed. Thank you for shopping with MyxelHome." />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex items-center justify-center px-4 py-16">
        <div
          className={`w-full max-w-2xl transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Hero confirmation */}
          <div className="text-center mb-10">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150" />
              <div className="relative rounded-full bg-background border border-border p-5 shadow-sm">
                <CheckCircle2 className="h-12 w-12 text-primary" strokeWidth={1.25} />
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              <Sparkles className="h-3 w-3" />
              <span>Order Confirmed</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-3">
              Thank you for your order
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              We've received your payment and our team is preparing your items with care.
            </p>
          </div>

          {/* Order details card */}
          <Card className="p-8 border-border/60 shadow-sm bg-card/80 backdrop-blur-sm">
            {sessionId && (
              <>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      Order reference
                    </p>
                    <p className="font-mono text-sm break-all">{sessionId.slice(0, 24)}…</p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Paid
                  </span>
                </div>
                <Separator className="mb-6" />
              </>
            )}

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="shrink-0 rounded-lg bg-muted p-2.5 h-fit">
                  <Mail className="h-4 w-4 text-foreground/70" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-0.5">Confirmation email</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A receipt with your order details is on its way to your inbox.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 rounded-lg bg-muted p-2.5 h-fit">
                  <Package className="h-4 w-4 text-foreground/70" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-0.5">Preparing your shipment</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your order will be processed within 1–2 business days. Tracking details will follow once it ships.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/shop">
                Continue shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
              <Link to="/">Back to home</Link>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-10">
            Questions? <Link to="/contact" className="underline underline-offset-4 hover:text-foreground">Contact our team</Link>
          </p>
        </div>
      </main>
    </>
  );
}

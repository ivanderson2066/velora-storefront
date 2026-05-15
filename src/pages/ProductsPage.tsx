import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  image_url: string | null;
}

export default function ProductsPage() {
  const { t, locale } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,description,price_cents,currency,image_url")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (!error && data) setProducts(data as Product[]);
      setLoading(false);
    })();
  }, []);

  const handleBuy = async (productId: string) => {
    try {
      setCheckingOut(productId);
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { productId, locale },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Missing checkout URL");
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setCheckingOut(null);
    }
  };

  const formatPrice = (cents: number, currency: string) =>
    new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);

  return (
    <>
      <Helmet>
        <title>{t("shop.title")}</title>
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 py-12 min-h-screen">
        <h1 className="text-3xl font-light tracking-tight mb-8">{t("shop.title")}</h1>

        {loading ? (
          <p className="text-muted-foreground">{t("shop.loading")}</p>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground">{t("shop.empty")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Card key={p.id} className="overflow-hidden flex flex-col">
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h2 className="text-lg font-medium">{p.name}</h2>
                  {p.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {p.description}
                    </p>
                  )}
                  <p className="text-xl font-semibold mt-auto">
                    {formatPrice(p.price_cents, p.currency)}
                  </p>
                  <Button
                    onClick={() => handleBuy(p.id)}
                    disabled={checkingOut === p.id}
                    className="w-full"
                  >
                    {checkingOut === p.id ? "…" : t("shop.buy")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

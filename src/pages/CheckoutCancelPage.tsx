import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  const { t } = useI18n();
  return (
    <>
      <Helmet><title>{t("checkout.cancel")}</title></Helmet>
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-light mb-2">{t("checkout.cancel")}</h1>
          <p className="text-muted-foreground mb-6">{t("checkout.cancel_msg")}</p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link to="/">{t("checkout.back")}</Link>
            </Button>
            <Button asChild>
              <Link to="/products">{t("shop.title")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}

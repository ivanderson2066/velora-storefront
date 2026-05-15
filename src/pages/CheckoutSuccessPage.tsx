import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  const { t } = useI18n();
  return (
    <>
      <Helmet><title>{t("checkout.success")}</title></Helmet>
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-light mb-2">{t("checkout.success")}</h1>
          <p className="text-muted-foreground mb-6">{t("checkout.success_msg")}</p>
          <Button asChild>
            <Link to="/">{t("checkout.back")}</Link>
          </Button>
        </div>
      </main>
    </>
  );
}

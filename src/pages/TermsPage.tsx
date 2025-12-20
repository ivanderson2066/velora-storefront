import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchShopPolicies } from "@/lib/shopify";
import { Loader2 } from "lucide-react";

const TermsPage = () => {
  const [termsHtml, setTermsHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const policies = await fetchShopPolicies();
        if (policies?.termsOfService?.body) {
          setTermsHtml(policies.termsOfService.body);
        }
      } catch (e) {
        console.error('Failed to load terms:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <>
      <Helmet>
        <title>Terms of Service | MyxelHome</title>
        <meta name="description" content="Terms of Service" />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <main className="velora-section bg-background min-h-[60vh]">
        <div className="velora-container max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : termsHtml ? (
            <>
              <h1 className="velora-heading-lg mb-8 text-center">Terms of Service</h1>
              <div
                className="prose prose-neutral max-w-none"
                dangerouslySetInnerHTML={{ __html: termsHtml }}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <h1 className="velora-heading-lg mb-4">Terms of Service</h1>
              <p className="text-muted-foreground">
                Our Terms of Service are being prepared. If you need immediate assistance,
                please contact our support.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default TermsPage;

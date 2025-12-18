import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchShopPolicies, ShopPolicy } from "@/lib/shopify";

type PolicyType = "privacy" | "refunds" | "shipping" | "terms";

const policyConfig: Record<PolicyType, { title: string; key: "privacyPolicy" | "refundPolicy" | "shippingPolicy" | "termsOfService" }> = {
  privacy: { title: "Privacy Policy", key: "privacyPolicy" },
  refunds: { title: "Refund Policy", key: "refundPolicy" },
  shipping: { title: "Shipping Policy", key: "shippingPolicy" },
  terms: { title: "Terms of Service", key: "termsOfService" },
};

const PolicyPage = () => {
  const location = useLocation();
  const type = location.pathname.replace('/', '') as PolicyType;
  const [policy, setPolicy] = useState<ShopPolicy | null>(null);
  const [loading, setLoading] = useState(true);

  const config = policyConfig[type] || policyConfig.privacy;

  useEffect(() => {
    const loadPolicy = async () => {
      setLoading(true);
      try {
        const policies = await fetchShopPolicies();
        if (policies && config.key) {
          setPolicy(policies[config.key]);
        }
      } catch (error) {
        console.error("Failed to load policy:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPolicy();
  }, [type, config.key]);

  return (
    <>
      <Helmet>
        <title>{config.title} | MyxelHome</title>
        <meta name="description" content={`Read MyxelHome's ${config.title.toLowerCase()}.`} />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <main className="velora-section bg-background min-h-[60vh]">
        <div className="velora-container max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : policy ? (
            <>
              <h1 className="velora-heading-lg mb-8 text-center">{policy.title}</h1>
              <div 
                className="prose prose-neutral max-w-none 
                  [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mb-4 [&_h1]:mt-8
                  [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6
                  [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:mt-4
                  [&_p]:text-muted-foreground [&_p]:mb-4 [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                  [&_li]:text-muted-foreground [&_li]:mb-2
                  [&_a]:text-accent [&_a]:underline [&_a]:hover:no-underline
                  [&_strong]:font-semibold [&_strong]:text-foreground"
                dangerouslySetInnerHTML={{ __html: policy.body }}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <h1 className="velora-heading-lg mb-4">{config.title}</h1>
              <p className="text-muted-foreground">
                This policy is currently being updated. Please check back soon or contact us for more information.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PolicyPage;
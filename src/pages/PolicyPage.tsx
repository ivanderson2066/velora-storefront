import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchShopPolicies, ShopPolicy } from "@/lib/shopify";

type PolicyType = "privacy" | "refunds" | "shipping" | "terms";

const defaultPolicies: Record<PolicyType, { title: string; body: string }> = {
  privacy: {
    title: "Privacy Policy",
    body: `
<h2>Information We Collect</h2>
<p>At MyxelHome, we collect information you provide directly to us, such as when you create an account, make a purchase, subscribe to our newsletter, or contact us for support. This includes your name, email address, shipping address, payment information, and phone number.</p>

<h2>How We Use Your Information</h2>
<p>We use the information we collect to process transactions, send you order confirmations and updates, respond to your comments and questions, send you marketing communications (with your consent), and improve our services.</p>

<h2>Information Sharing</h2>
<p>We do not sell, trade, or otherwise transfer your personal information to third parties. We may share information with trusted partners who assist us in operating our website, conducting our business, or servicing you, as long as those parties agree to keep this information confidential.</p>

<h2>Data Security</h2>
<p>We implement a variety of security measures to maintain the safety of your personal information. Your payment information is encrypted using SSL technology and we do not store credit card details on our servers.</p>

<h2>Cookies</h2>
<p>We use cookies to understand and save your preferences for future visits, keep track of advertisements, and compile aggregate data about site traffic and site interaction.</p>

<h2>Your Rights</h2>
<p>You have the right to access, correct, or delete your personal information. You may also opt out of receiving marketing communications at any time by clicking the unsubscribe link in our emails.</p>

<h2>Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us through our <a href="/contact">Contact Page</a>.</p>
`
  },
  refunds: {
    title: "Refund Policy",
    body: `
<h2>30-Day Money-Back Guarantee</h2>
<p>We want you to be completely satisfied with your purchase. If you're not happy with your order for any reason, you may return it within 30 days of delivery for a full refund.</p>

<h2>Eligibility for Returns</h2>
<p>To be eligible for a return, items must be unused, in their original packaging, and in the same condition that you received them. Please include all original accessories and documentation.</p>

<h2>How to Request a Return</h2>
<p>To initiate a return, please contact our customer service team through our <a href="/contact">Contact Page</a> with your order number and reason for the return. We will provide you with return instructions and a return shipping label.</p>

<h2>Refund Process</h2>
<p>Once we receive your returned item, we will inspect it and notify you of the approval or rejection of your refund. If approved, your refund will be processed within 5-7 business days and credited to your original payment method.</p>

<h2>Damaged or Defective Items</h2>
<p>If you receive a damaged or defective item, please contact us immediately with photos of the damage. We will arrange for a replacement or full refund at no additional cost to you.</p>

<h2>Exchanges</h2>
<p>If you need to exchange an item for a different size, color, or product, please contact us. We will guide you through the exchange process.</p>

<h2>Non-Returnable Items</h2>
<p>Some items cannot be returned, including personalized or custom-made products and items marked as final sale.</p>
`
  },
  shipping: {
    title: "Shipping Policy",
    body: `
<h2>Processing Time</h2>
<p>Orders are typically processed within 1-3 business days. During peak seasons or promotional periods, processing may take an additional 1-2 days.</p>

<h2>Free Shipping to USA</h2>
<p>We offer FREE standard shipping on all orders within the United States. No minimum purchase required!</p>

<h2>Shipping Methods & Delivery Times</h2>
<ul>
  <li><strong>Standard Shipping (Free):</strong> 5-10 business days</li>
  <li><strong>Express Shipping:</strong> 2-5 business days (additional fee)</li>
  <li><strong>Priority Shipping:</strong> 1-3 business days (additional fee)</li>
</ul>

<h2>International Shipping</h2>
<p>We ship to select international destinations. International shipping rates and delivery times vary by location. Import duties and taxes may apply and are the responsibility of the customer.</p>

<h2>Order Tracking</h2>
<p>Once your order ships, you will receive an email with tracking information. You can also track your order status in your account dashboard.</p>

<h2>Shipping Address</h2>
<p>Please ensure your shipping address is correct before completing your purchase. We are not responsible for orders shipped to incorrect addresses provided by the customer.</p>

<h2>Lost or Delayed Packages</h2>
<p>If your package appears to be lost or significantly delayed, please contact us. We will work with the carrier to locate your package or arrange for a replacement.</p>

<h2>Contact Us</h2>
<p>For any shipping-related questions, please visit our <a href="/contact">Contact Page</a>.</p>
`
  },
  terms: {
    title: "Terms of Service",
    body: `
<h2>Agreement to Terms</h2>
<p>By accessing or using MyxelHome's website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

<h2>Use License</h2>
<p>Permission is granted to temporarily access the materials on MyxelHome's website for personal, non-commercial transitory viewing only.</p>

<h2>Product Purchases</h2>
<p>All purchases are subject to product availability. We reserve the right to refuse any order and to discontinue any product at any time.</p>

<h2>Disclaimer</h2>
<p>The materials on MyxelHome's website are provided on an 'as is' basis. We make no warranties, expressed or implied.</p>

<h2>Contact</h2>
<p>For questions about these terms, please contact us through our <a href="/contact">Contact Page</a>.</p>
`
  }
};

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
  const defaultPolicy = defaultPolicies[type] || defaultPolicies.privacy;

  useEffect(() => {
    const loadPolicy = async () => {
      setLoading(true);
      try {
        const policies = await fetchShopPolicies();
        if (policies && policies[config.key]?.body) {
          setPolicy(policies[config.key]);
        } else {
          // Use default professional content
          setPolicy({ title: defaultPolicy.title, body: defaultPolicy.body, handle: type });
        }
      } catch (error) {
        console.error("Failed to load policy:", error);
        setPolicy({ title: defaultPolicy.title, body: defaultPolicy.body, handle: type });
      } finally {
        setLoading(false);
      }
    };

    loadPolicy();
  }, [type, config.key, defaultPolicy.title, defaultPolicy.body]);

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
              <p className="text-center text-muted-foreground mb-12">Last updated: December 2024</p>
              <div 
                className="prose prose-neutral dark:prose-invert max-w-none 
                  [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-4 [&_h2]:mt-8
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
          ) : null}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PolicyPage;
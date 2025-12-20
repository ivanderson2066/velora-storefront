import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchShopPolicies } from "@/lib/shopify";
import { Loader2 } from "lucide-react";

const defaultTermsContent = `
<h2>1. Agreement to Terms</h2>
<p>By accessing or using MyxelHome's website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>

<h2>2. Use License</h2>
<p>Permission is granted to temporarily access the materials (information or software) on MyxelHome's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
<ul>
  <li>Modify or copy the materials</li>
  <li>Use the materials for any commercial purpose or for any public display</li>
  <li>Attempt to decompile or reverse engineer any software contained on the website</li>
  <li>Remove any copyright or other proprietary notations from the materials</li>
  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
</ul>

<h2>3. Product Purchases</h2>
<p>All purchases through our site are subject to product availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice. We reserve the right to refuse any order you place with us.</p>

<h2>4. Accuracy of Information</h2>
<p>We are not responsible if information made available on this site is not accurate, complete, or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions.</p>

<h2>5. Third-Party Links</h2>
<p>Our site may contain links to third-party websites or services that are not owned or controlled by MyxelHome. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.</p>

<h2>6. Disclaimer</h2>
<p>The materials on MyxelHome's website are provided on an 'as is' basis. MyxelHome makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

<h2>7. Limitations</h2>
<p>In no event shall MyxelHome or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MyxelHome's website.</p>

<h2>8. Governing Law</h2>
<p>These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>

<h2>9. Changes to Terms</h2>
<p>MyxelHome reserves the right to modify these terms of service at any time. We will notify users of any changes by posting the new Terms of Service on this page. Your continued use of the website after any changes indicates your acceptance of the new Terms of Service.</p>

<h2>10. Contact Us</h2>
<p>If you have any questions about these Terms of Service, please contact us through our <a href="/contact">Contact Page</a>.</p>
`;

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
        } else {
          // Use default professional content
          setTermsHtml(defaultTermsContent);
        }
      } catch (e) {
        console.error('Failed to load terms:', e);
        setTermsHtml(defaultTermsContent);
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
        <meta name="description" content="Read the Terms of Service for MyxelHome. Learn about our policies and your rights when using our website and services." />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <main className="velora-section bg-background min-h-[60vh]">
        <div className="velora-container max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <h1 className="velora-heading-lg mb-8 text-center">Terms of Service</h1>
              <p className="text-center text-muted-foreground mb-12">Last updated: December 2024</p>
              <div
                className="prose prose-neutral dark:prose-invert max-w-none [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mb-4 [&_ul]:mb-4 [&_li]:mb-2"
                dangerouslySetInnerHTML={{ __html: termsHtml || '' }}
              />
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default TermsPage;

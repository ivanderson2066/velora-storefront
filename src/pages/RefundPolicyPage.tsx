import { Helmet } from "react-helmet-async";
import { RefreshCw, Check, Clock, AlertCircle, Package, Mail } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const RefundPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Refund & Return Policy | MyxelHome</title>
        <meta 
          name="description" 
          content="MyxelHome's 30-day money-back guarantee. Learn about our hassle-free return process and refund policy." 
        />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <main className="bg-background">
        {/* Hero */}
        <section className="velora-section bg-secondary/30">
          <div className="velora-container text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-6 text-accent" />
            <h1 className="velora-heading-lg mb-4">Refund & Return Policy</h1>
            <p className="velora-body text-muted-foreground max-w-2xl mx-auto">
              Your satisfaction is our top priority. We offer a hassle-free 30-day money-back guarantee 
              on all our products.
            </p>
          </div>
        </section>

        {/* Guarantee Banner */}
        <section className="py-8 bg-primary text-primary-foreground">
          <div className="velora-container">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
              <Check className="w-8 h-8" />
              <p className="text-lg font-semibold">
                30-Day Money-Back Guarantee — No Questions Asked
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="velora-section">
          <div className="velora-container max-w-4xl">
            {/* Eligibility */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Check className="w-6 h-6 text-accent" />
                <h2 className="velora-heading-md">Return Eligibility</h2>
              </div>
              <div className="bg-secondary/30 rounded-lg p-8">
                <p className="text-muted-foreground mb-6">
                  We want you to love your purchase. If you're not completely satisfied, you can return your 
                  item within 30 days of delivery for a full refund, provided:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span>The item is in its original, unused condition</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span>All original packaging and accessories are included</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span>The return is initiated within 30 days of delivery</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span>You have your order number or proof of purchase</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Return Process */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-accent" />
                <h2 className="velora-heading-md">How to Return an Item</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-border/50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Step 1: Contact Us</h3>
                  <p className="text-sm text-muted-foreground">
                    Email us at support@myxelhome.com with your order number and reason for return.
                  </p>
                </div>
                <div className="text-center p-6 border border-border/50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Step 2: Pack & Ship</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll send you return instructions. Pack the item securely and ship it back.
                  </p>
                </div>
                <div className="text-center p-6 border border-border/50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Step 3: Get Refunded</h3>
                  <p className="text-sm text-muted-foreground">
                    Once we receive your return, we'll process your refund within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Refund Timeline */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-accent" />
                <h2 className="velora-heading-md">Refund Timeline</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Processing Time:</strong> Refunds are processed within 
                  5-7 business days after we receive and inspect your return.
                </p>
                <p>
                  <strong className="text-foreground">Credit Appearance:</strong> Depending on your bank or 
                  credit card company, it may take an additional 5-10 business days for the refund to appear 
                  in your account.
                </p>
                <p>
                  <strong className="text-foreground">Refund Method:</strong> Refunds are issued to the 
                  original payment method used for the purchase.
                </p>
              </div>
            </div>

            {/* Damaged/Defective Items */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-accent" />
                <h2 className="velora-heading-md">Damaged or Defective Items</h2>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-8">
                <p className="text-muted-foreground mb-4">
                  Received a damaged or defective product? We're sorry! Here's what to do:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="font-semibold text-foreground">1.</span>
                    <span>Contact us within 48 hours of delivery</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-semibold text-foreground">2.</span>
                    <span>Send photos of the damage and the packaging</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-semibold text-foreground">3.</span>
                    <span>We'll arrange a free replacement or full refund—your choice!</span>
                  </li>
                </ul>
                <p className="mt-4 text-sm">
                  <strong>Note:</strong> Return shipping is free for all defective or damaged items.
                </p>
              </div>
            </div>

            {/* Exceptions */}
            <div className="mb-16">
              <h2 className="velora-heading-md mb-6">Non-Returnable Items</h2>
              <p className="text-muted-foreground mb-4">
                For health and safety reasons, the following items cannot be returned:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Items marked as "Final Sale" or "Non-Returnable"</li>
                <li>Products that have been used, altered, or damaged by the customer</li>
                <li>Items without original packaging or accessories</li>
                <li>Gift cards</li>
              </ul>
            </div>

            {/* Exchanges */}
            <div>
              <h2 className="velora-heading-md mb-6">Exchanges</h2>
              <p className="text-muted-foreground">
                We currently don't offer direct exchanges. If you'd like a different product or variant, 
                please return your original item for a refund and place a new order. This ensures you 
                get your replacement as quickly as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-12 bg-secondary/30">
          <div className="velora-container text-center">
            <p className="text-muted-foreground">
              Questions about returns? <a href="/contact" className="text-foreground underline hover:no-underline">Contact our support team</a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default RefundPolicyPage;
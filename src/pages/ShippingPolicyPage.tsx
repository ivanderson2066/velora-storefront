import { Helmet } from "react-helmet-async";
import { Truck, Clock, Globe, Package, Shield, MapPin } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const ShippingPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Shipping Policy | MyxelHome</title>
        <meta 
          name="description" 
          content="Learn about MyxelHome's shipping options, delivery times, and international shipping. Free shipping on all US orders." 
        />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <main className="bg-background">
        {/* Hero */}
        <section className="velora-section bg-secondary/30">
          <div className="velora-container text-center">
            <Truck className="w-12 h-12 mx-auto mb-6 text-accent" />
            <h1 className="velora-heading-lg mb-4">Shipping Policy</h1>
            <p className="velora-body text-muted-foreground max-w-2xl mx-auto">
              We're committed to getting your order to you as quickly and safely as possible. 
              Here's everything you need to know about our shipping process.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="velora-section">
          <div className="velora-container max-w-4xl">
            {/* Shipping Times */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-accent" />
                <h2 className="velora-heading-md">Processing & Delivery Times</h2>
              </div>
              <div className="bg-secondary/30 rounded-lg p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-accent pl-4">
                    <h3 className="font-semibold mb-2">Order Processing</h3>
                    <p className="text-muted-foreground">
                      All orders are processed within <strong>1-3 business days</strong> (excluding weekends and holidays). 
                      You'll receive a confirmation email once your order ships.
                    </p>
                  </div>
                  <div className="border-l-4 border-accent pl-4">
                    <h3 className="font-semibold mb-2">USA Standard Shipping</h3>
                    <p className="text-muted-foreground">
                      <strong>5-10 business days</strong> after processing. 
                      Free on all orders—no minimum purchase required.
                    </p>
                  </div>
                  <div className="border-l-4 border-accent pl-4">
                    <h3 className="font-semibold mb-2">USA Express Shipping</h3>
                    <p className="text-muted-foreground">
                      <strong>2-5 business days</strong> after processing. 
                      Available at checkout for an additional fee.
                    </p>
                  </div>
                  <div className="border-l-4 border-accent pl-4">
                    <h3 className="font-semibold mb-2">International Shipping</h3>
                    <p className="text-muted-foreground">
                      <strong>10-20 business days</strong> depending on destination. 
                      Rates calculated at checkout.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Rates */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-accent" />
                <h2 className="velora-heading-md">Shipping Rates</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-semibold">Destination</th>
                      <th className="text-left py-4 px-4 font-semibold">Method</th>
                      <th className="text-left py-4 px-4 font-semibold">Estimated Time</th>
                      <th className="text-left py-4 px-4 font-semibold">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-4 px-4">United States</td>
                      <td className="py-4 px-4">Standard</td>
                      <td className="py-4 px-4">5-10 business days</td>
                      <td className="py-4 px-4 text-accent font-semibold">FREE</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-4 px-4">United States</td>
                      <td className="py-4 px-4">Express</td>
                      <td className="py-4 px-4">2-5 business days</td>
                      <td className="py-4 px-4">$9.99</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-4 px-4">Canada</td>
                      <td className="py-4 px-4">Standard</td>
                      <td className="py-4 px-4">10-15 business days</td>
                      <td className="py-4 px-4">$12.99</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-4 px-4">Europe</td>
                      <td className="py-4 px-4">Standard</td>
                      <td className="py-4 px-4">12-18 business days</td>
                      <td className="py-4 px-4">$14.99</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">Rest of World</td>
                      <td className="py-4 px-4">Standard</td>
                      <td className="py-4 px-4">15-25 business days</td>
                      <td className="py-4 px-4">Calculated at checkout</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* International */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-accent" />
                <h2 className="velora-heading-md">International Orders</h2>
              </div>
              <div className="prose prose-neutral max-w-none text-muted-foreground space-y-4">
                <p>
                  We ship to most countries worldwide. Please note:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Customs & Import Duties:</strong> International shipments may be subject to import taxes, 
                    customs duties, and fees levied by the destination country. These charges are the recipient's 
                    responsibility and are not included in the shipping cost.
                  </li>
                  <li>
                    <strong>Delivery Delays:</strong> International shipments may experience delays due to customs 
                    processing. These delays are beyond our control but are typically minimal.
                  </li>
                  <li>
                    <strong>Address Accuracy:</strong> Please ensure your shipping address is complete and accurate, 
                    including postal codes. We are not responsible for packages sent to incorrect addresses.
                  </li>
                </ul>
              </div>
            </div>

            {/* Tracking */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-accent" />
                <h2 className="velora-heading-md">Order Tracking</h2>
              </div>
              <div className="bg-secondary/30 rounded-lg p-8">
                <p className="text-muted-foreground mb-4">
                  Once your order ships, you'll receive an email with your tracking number. You can use this number 
                  to track your package's journey right to your doorstep.
                </p>
                <p className="text-muted-foreground">
                  <strong>Note:</strong> Tracking information typically updates within 24-48 hours of shipment. 
                  If you don't see updates after 48 hours, please contact our support team.
                </p>
              </div>
            </div>

            {/* Secure Shipping */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-accent" />
                <h2 className="velora-heading-md">Secure Packaging</h2>
              </div>
              <p className="text-muted-foreground">
                Every order is carefully packaged to ensure your products arrive in perfect condition. 
                We use protective materials and secure boxes designed to withstand the shipping process. 
                If your package arrives damaged, please contact us within 48 hours with photos of the damage 
                and we'll make it right.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-12 bg-secondary/30">
          <div className="velora-container text-center">
            <p className="text-muted-foreground">
              Have questions about shipping? <a href="/contact" className="text-foreground underline hover:no-underline">Contact our support team</a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ShippingPolicyPage;
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Check, Minus, Plus, Shield, Star, Truck, RefreshCw, Award } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const ProductPage = () => {
  const [quantity, setQuantity] = useState(1);

  const benefits = [
    { icon: Award, text: "Minimalist Design" },
    { icon: Shield, text: "Durable, Premium Materials" },
    { icon: Check, text: "Easy to Use" },
    { icon: Star, text: "Perfect for Daily Life" },
  ];

  return (
    <>
      <Helmet>
        <title>Minimalist Smart Lifestyle Essential — VELORA</title>
        <meta
          name="description"
          content="Designed to seamlessly fit into modern routines, this product combines elegant design with everyday practicality."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Header />

        <main className="velora-section">
          <div className="velora-container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Product Image */}
              <div>
                <div className="aspect-square bg-secondary rounded-sm overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80"
                    alt="Minimalist Smart Lifestyle Essential"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="lg:py-8">
                <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
                  Lifestyle
                </p>
                <h1 className="velora-heading-lg mb-4">
                  Minimalist Smart Lifestyle Essential
                </h1>
                <p className="text-2xl font-semibold mb-6">$89.00</p>

                {/* Short Description */}
                <p className="velora-body mb-8">
                  Designed to seamlessly fit into modern routines, this product combines
                  elegant design with everyday practicality.
                </p>

                {/* Key Benefits */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <benefit.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                {/* Quantity & Add to Cart */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex items-center border border-border rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <Button variant="velora" size="xl" className="flex-1">
                    Add to Cart
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-6 py-6 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="w-4 h-4" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="w-4 h-4" />
                    <span>30-Day Returns</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Secure Checkout</span>
                  </div>
                </div>

                {/* Long Description */}
                <div className="py-6 border-t border-border/50">
                  <h3 className="text-sm font-semibold tracking-wide uppercase mb-4">
                    Description
                  </h3>
                  <div className="space-y-4">
                    <p className="velora-body-sm">
                      This product was created for those who value simplicity and quality.
                    </p>
                    <p className="velora-body-sm">
                      Its clean design complements any environment while delivering
                      reliable performance you can count on every day.
                    </p>
                  </div>
                </div>

                {/* Guarantee */}
                <div className="p-6 bg-secondary/50 rounded-sm">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-foreground mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">30-Day Risk-Free Guarantee</p>
                      <p className="text-sm text-muted-foreground">
                        If you're not satisfied, return it within 30 days for a full refund.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductPage;

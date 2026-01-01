import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] lg:min-h-[85vh] flex items-center bg-gradient-to-br from-secondary/30 via-background to-secondary/20 py-8 lg:py-0">
      <div className="velora-container w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-6 animate-fade-up">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs tracking-wider uppercase text-accent font-medium">
                Free Shipping to USA
              </span>
            </div>
            <h1 className="velora-heading-xl mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
              Transform Your
              <br />
              Living Space
            </h1>
            <p className="velora-body max-w-md mb-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
              Discover innovative smart home gadgets that combine cutting-edge technology with stunning design. Create the perfect ambiance for your home.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "300ms" }}>
              <Link to="/shop">
                <Button variant="velora" size="xl">
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/collections">
                <Button variant="velora-outline" size="xl">
                  View Collections
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-border/30 animate-fade-up" style={{ animationDelay: "400ms" }}>
              <div className="text-center">
                <p className="text-2xl font-semibold">10k+</p>
                <p className="text-xs text-muted-foreground">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-border/50" />
              <div className="text-center">
                <p className="text-2xl font-semibold">4.9★</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
              <div className="w-px h-10 bg-border/50" />
              <div className="text-center">
                <p className="text-2xl font-semibold">30-Day</p>
                <p className="text-xs text-muted-foreground">Money Back</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="relative aspect-[4/5] lg:aspect-[3/4] bg-gradient-to-br from-accent/20 to-secondary rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
                alt="Modern smart home ambient lighting"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              
              {/* Floating badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <p className="text-sm font-medium mb-1">Best Seller</p>
                <p className="text-xs text-muted-foreground">Anti-Gravity™ Levitating Clock</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
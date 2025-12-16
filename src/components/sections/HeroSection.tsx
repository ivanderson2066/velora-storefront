import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center bg-secondary/30">
      <div className="velora-container w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 animate-fade-up">
              Designed for Modern Living
            </p>
            <h1 className="velora-heading-xl mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
              Elevate Your
              <br />
              Everyday.
            </h1>
            <p className="velora-body max-w-md mb-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
              Thoughtfully designed essentials that blend function, comfort, and modern aesthetics.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "300ms" }}>
              <Button variant="velora" size="xl">
                Shop the Collection
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="velora-outline" size="xl">
                Our Story
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="relative aspect-[4/5] lg:aspect-[3/4] bg-velora-sand/50 rounded-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
                alt="Minimalist home interior with modern furniture"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="velora-section bg-secondary/30">
      <div className="velora-container">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Start Today
          </p>
          <h2 className="velora-heading-lg mb-6">
            Bring Simplicity
            <br />
            Into Your Life
          </h2>
          <p className="velora-body mb-8">
            Discover our collection of thoughtfully designed essentials and elevate your everyday routine.
          </p>
          <Button variant="velora" size="xl">
            Explore Velora
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;

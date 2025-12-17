import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="velora-section bg-gradient-to-br from-secondary/50 via-background to-accent/10">
      <div className="velora-container">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Ready to Transform?
          </p>
          <h2 className="velora-heading-lg mb-6">
            Elevate Your Home
            <br />
            Today
          </h2>
          <p className="velora-body mb-8">
            Discover innovative smart home gadgets that combine stunning design with cutting-edge technology. Free shipping on all USA orders.
          </p>
          <Link to="/shop">
            <Button variant="velora" size="xl">
              Shop Now
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
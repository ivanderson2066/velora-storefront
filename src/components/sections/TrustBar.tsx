import { Truck, Shield, RefreshCw, Award } from "lucide-react";

const TrustBar = () => {
  const trustItems = [
    {
      icon: Truck,
      title: "Free Worldwide Shipping",
      description: "On all orders",
    },
    {
      icon: RefreshCw,
      title: "30-Day Money Back",
      description: "Full refund guarantee",
    },
    {
      icon: Shield,
      title: "Secure Checkout",
      description: "SSL encrypted payment",
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "Carefully selected materials",
    },
  ];

  return (
    <section className="py-12 lg:py-16 border-y border-border/50">
      <div className="velora-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-smooth">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;

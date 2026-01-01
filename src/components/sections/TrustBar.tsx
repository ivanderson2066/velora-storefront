import { Check } from "lucide-react";

const TrustBar = () => {
  const items = [
    { title: "Free US Shipping", subtitle: "On orders over $50" },
    { title: "30-Day Returns", subtitle: "Hassle-free returns" },
    { title: "Secure Payment", subtitle: "SSL encrypted checkout" },
    { title: "24/7 Support", subtitle: "We&apos;re here to help" },
  ];

  return (
    <section className="velora-section bg-secondary/30">
      <div className="velora-container">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center text-center">
          {items.map((it) => (
            <div key={it.title} className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-foreground/5 mb-3">
                <Check className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-medium">{it.title}</h4>
              <p className="text-sm text-muted-foreground">{it.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
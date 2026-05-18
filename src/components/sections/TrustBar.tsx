import { Truck, RotateCcw, ShieldCheck, Headphones, type LucideIcon } from "lucide-react";

type Item = { title: string; subtitle: string; Icon: LucideIcon };

const TrustBar = () => {
  const items: Item[] = [
    { title: "Free US Shipping", subtitle: "On orders over $50", Icon: Truck },
    { title: "30-Day Returns", subtitle: "Hassle-free returns", Icon: RotateCcw },
    { title: "Secure Payment", subtitle: "SSL encrypted checkout", Icon: ShieldCheck },
    { title: "24/7 Support", subtitle: "We are here to help", Icon: Headphones },
  ];

  return (
    <section className="velora-section bg-secondary/30">
      <div className="velora-container">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center text-center">
          {items.map(({ title, subtitle, Icon }) => (
            <div key={title} className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-foreground/5 mb-3">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-medium">{title}</h4>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
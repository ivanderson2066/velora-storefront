import { Check, Truck, Shield } from "lucide-react";

const AnnouncementBar = () => {
  const announcements = [
    { icon: Truck, text: "Free USA Shipping on All Orders" },
    { icon: Shield, text: "100% Secure Checkout" },
    { icon: Check, text: "30-Day Money-Back Guarantee" },
  ];

  return (
    <div className="bg-primary text-primary-foreground py-3">
      <div className="velora-container">
        <div className="flex items-center justify-center gap-8 text-xs tracking-wide font-medium">
          {announcements.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <item.icon className="w-4 h-4" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
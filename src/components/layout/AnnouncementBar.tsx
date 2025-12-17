import { Check, Truck } from "lucide-react";

const AnnouncementBar = () => {
  const announcements = [
    { icon: Truck, text: "Free USA Shipping" },
    { icon: Check, text: "30-Day Money Back" },
    { icon: Check, text: "Secure Checkout" },
  ];

  return (
    <div className="bg-primary text-primary-foreground py-2.5">
      <div className="velora-container">
        <div className="flex items-center justify-center gap-6 text-xs tracking-wide">
          {announcements.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
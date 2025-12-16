import { Check } from "lucide-react";

const AnnouncementBar = () => {
  const announcements = [
    "Free Worldwide Shipping",
    "Secure Checkout",
    "30-Day Money Back Guarantee",
  ];

  return (
    <div className="bg-primary text-primary-foreground py-2.5">
      <div className="velora-container">
        <div className="flex items-center justify-center gap-6 text-xs tracking-wide">
          {announcements.map((text, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;

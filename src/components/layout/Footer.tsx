import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  const shopLinks = [
    { label: "All Products", href: "#" },
    { label: "New Arrivals", href: "#" },
    { label: "Best Sellers", href: "#" },
    { label: "Sale", href: "#" },
  ];

  const infoLinks = [
    { label: "About Us", href: "#about" },
    { label: "Contact Us", href: "#contact" },
    { label: "Shipping Policy", href: "#" },
    { label: "Refund Policy", href: "#" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="velora-container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold tracking-[0.15em] uppercase mb-4">
              Velora
            </h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed mb-6">
              A modern lifestyle brand focused on timeless design and everyday functionality.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-4">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-4">
              Information
            </h4>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-primary-foreground/50">
              © {new Date().getFullYear()} Velora. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-primary-foreground/50">
                Secure & Encrypted Checkout
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

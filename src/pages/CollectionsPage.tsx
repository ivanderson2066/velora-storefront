import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const CollectionsPage = () => {
  const collections = [
    {
      id: 1,
      name: "Home Essentials",
      description: "Thoughtfully designed pieces for a serene living space.",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
      productCount: 24,
    },
    {
      id: 2,
      name: "Workspace",
      description: "Minimal tools to inspire focus and productivity.",
      image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80",
      productCount: 18,
    },
    {
      id: 3,
      name: "Travel & On-the-Go",
      description: "Compact essentials for the modern traveler.",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      productCount: 12,
    },
    {
      id: 4,
      name: "Lighting",
      description: "Ambient lighting to set the perfect mood.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      productCount: 15,
    },
    {
      id: 5,
      name: "Textiles",
      description: "Premium fabrics for comfort and elegance.",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      productCount: 20,
    },
    {
      id: 6,
      name: "Storage & Organization",
      description: "Beautifully simple solutions for everyday order.",
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80",
      productCount: 16,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Collections | VELORA - Modern Lifestyle Essentials</title>
        <meta
          name="description"
          content="Explore our curated collections of minimalist, thoughtfully designed products for modern living."
        />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <main>
        {/* Hero Section */}
        <section className="velora-section bg-secondary/30">
          <div className="velora-container text-center">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Our Collections
            </p>
            <h1 className="velora-heading-lg mb-4">Curated for Modern Living</h1>
            <p className="velora-body max-w-xl mx-auto">
              Each collection is thoughtfully assembled to bring harmony, functionality, and timeless design into your everyday life.
            </p>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="velora-section bg-background">
          <div className="velora-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.id}`}
                  className="group block"
                >
                  <article className="relative overflow-hidden rounded-sm">
                    {/* Image */}
                    <div className="aspect-[4/5] bg-secondary overflow-hidden">
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
                      />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-smooth" />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent">
                      <div className="text-background">
                        <p className="text-xs tracking-[0.2em] uppercase mb-2 opacity-80">
                          {collection.productCount} Products
                        </p>
                        <h2 className="text-xl lg:text-2xl font-medium mb-2 tracking-wide">
                          {collection.name}
                        </h2>
                        <p className="text-sm opacity-80 mb-4 line-clamp-2">
                          {collection.description}
                        </p>
                        <span className="inline-flex items-center text-sm font-medium group-hover:gap-2 transition-all duration-smooth">
                          Explore
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-smooth" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Promise */}
        <section className="velora-section bg-secondary/30">
          <div className="velora-container text-center">
            <h2 className="velora-heading-md mb-4">Why Choose Velora</h2>
            <p className="velora-body max-w-2xl mx-auto mb-10">
              Every product in our collections is selected for its exceptional design, quality materials, and ability to enhance your daily routine.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div>
                <p className="text-3xl font-light mb-2">100%</p>
                <p className="text-sm text-muted-foreground">Quality Guaranteed</p>
              </div>
              <div>
                <p className="text-3xl font-light mb-2">30 Days</p>
                <p className="text-sm text-muted-foreground">Easy Returns</p>
              </div>
              <div>
                <p className="text-3xl font-light mb-2">Free</p>
                <p className="text-sm text-muted-foreground">Worldwide Shipping</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default CollectionsPage;

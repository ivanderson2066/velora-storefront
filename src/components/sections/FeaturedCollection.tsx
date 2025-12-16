import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturedCollection = () => {
  const products = [
    {
      id: 1,
      name: "Minimal Desk Lamp",
      price: "$89",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
      category: "Lighting",
    },
    {
      id: 2,
      name: "Ceramic Vase Set",
      price: "$65",
      image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&q=80",
      category: "Decor",
    },
    {
      id: 3,
      name: "Wooden Storage Box",
      price: "$45",
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=80",
      category: "Storage",
    },
    {
      id: 4,
      name: "Linen Throw Blanket",
      price: "$120",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
      category: "Textiles",
    },
  ];

  return (
    <section id="shop" className="velora-section bg-background">
      <div className="velora-container">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Featured
          </p>
          <h2 className="velora-heading-lg mb-4">Modern Essentials</h2>
          <p className="velora-body max-w-xl mx-auto">
            Curated products designed to enhance your daily routine — at home, at work, and on the go.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {products.map((product) => (
            <article
              key={product.id}
              className="group cursor-pointer"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] bg-secondary rounded-sm overflow-hidden mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-smooth" />
              </div>

              {/* Info */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                <h3 className="text-sm font-medium mb-1 group-hover:text-muted-foreground transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm font-medium">{product.price}</p>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="velora-outline" size="lg">
            View All Products
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/products/ProductCard";

const FeaturedCollection = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(4);
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section id="shop" className="velora-section bg-background">
      <div className="velora-container">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Featured Products
          </p>
          <h2 className="velora-heading-lg mb-4">Smart Home Essentials</h2>
          <p className="velora-body max-w-xl mx-auto">
            Discover our best-selling innovative gadgets that transform your home into a modern sanctuary.
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
            {products.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link to="/shop">
            <Button variant="velora-outline" size="lg">
              View All Products
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
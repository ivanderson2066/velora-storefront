import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";

const ShopPage = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(50);
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
    <>
      <Helmet>
        <title>Shop | MyxelHome - Smart Home Technology</title>
        <meta
          name="description"
          content="Shop innovative smart home gadgets. Levitating clocks, ambient lighting, humidifiers & more. Free USA shipping."
        />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <main>
        <section className="velora-section bg-secondary/30">
          <div className="velora-container text-center">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Our Products
            </p>
            <h1 className="velora-heading-lg mb-4">Shop All</h1>
            <p className="velora-body max-w-xl mx-auto">
              Discover our complete collection of thoughtfully designed essentials for modern living.
            </p>
          </div>
        </section>

        <section className="velora-section bg-background">
          <div className="velora-container">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {products.map((product) => (
                  <ProductCard key={product.node.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ShopPage;

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";

interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  query?: string;
}

const collections: Collection[] = [
  {
    id: "lighting",
    name: "Ambient Lighting",
    description: "Create the perfect atmosphere with our innovative lighting solutions.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    query: "product_type:Home Decor",
  },
  {
    id: "smart-home",
    name: "Smart Home",
    description: "Intelligent gadgets that make everyday life easier.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    query: "product_type:Smart Home OR product_type:Humidifier",
  },
  {
    id: "car",
    name: "Car Accessories",
    description: "Premium accessories for your vehicle.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    query: "product_type:Car Accessories",
  },
];

const CollectionsPage = () => {
  const { collectionId } = useParams<{ collectionId?: string }>();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const currentCollection = collectionId 
    ? collections.find(c => c.id === collectionId) 
    : null;

  useEffect(() => {
    if (currentCollection) {
      setLoading(true);
      fetchProducts(20, currentCollection.query)
        .then(setProducts)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [currentCollection]);

  // Show collection detail if we have a collectionId
  if (currentCollection) {
    return (
      <>
        <Helmet>
          <title>{currentCollection.name} | MyxelHome</title>
          <meta name="description" content={currentCollection.description} />
        </Helmet>

        <AnnouncementBar />
        <Header />

        <main>
          {/* Collection Hero */}
          <section className="velora-section bg-secondary/30">
            <div className="velora-container text-center">
              <Link to="/collections" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                ← Back to Collections
              </Link>
              <h1 className="velora-heading-lg mb-4">{currentCollection.name}</h1>
              <p className="velora-body max-w-xl mx-auto">
                {currentCollection.description}
              </p>
            </div>
          </section>

          {/* Products Grid */}
          <section className="velora-section bg-background">
            <div className="velora-container">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4">No products found in this collection</p>
                  <Link to="/shop" className="text-accent hover:underline">
                    Browse all products →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
  }

  // Show all collections
  return (
    <>
      <Helmet>
        <title>Collections | MyxelHome - Smart Home Categories</title>
        <meta
          name="description"
          content="Explore our curated collections of smart home products. Ambient lighting, smart gadgets, and car accessories."
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
            <h1 className="velora-heading-lg mb-4">Shop by Category</h1>
            <p className="velora-body max-w-xl mx-auto">
              Discover our carefully curated collections of innovative smart home technology.
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
                  <article className="relative overflow-hidden rounded-lg">
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
                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent">
                      <div className="text-background">
                        <h2 className="text-xl lg:text-2xl font-medium mb-2 tracking-wide">
                          {collection.name}
                        </h2>
                        <p className="text-sm opacity-80 mb-4 line-clamp-2">
                          {collection.description}
                        </p>
                        <span className="inline-flex items-center text-sm font-medium group-hover:gap-2 transition-all duration-smooth">
                          Shop Now
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
            <h2 className="velora-heading-md mb-4">Why Choose MyxelHome</h2>
            <p className="velora-body max-w-2xl mx-auto mb-10">
              Every product is selected for its innovation, quality, and ability to transform your living space.
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
                <p className="text-sm text-muted-foreground">USA Shipping</p>
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
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, ChevronLeft, Minus, Plus, Check, Shield, Truck, RefreshCw, CreditCard, ShoppingBag } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { fetchProducts, fetchProductByHandle, ShopifyProduct, parseReviewData, fetchVariantPrices } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ProductCard } from "@/components/products/ProductCard";
import { StarRating } from "@/components/products/StarRating";
import { JudgeMeReviews } from "@/components/products/JudgeMeReviews";
import { toast } from "sonner";

interface ProductNode {
  id: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
        selectedOptions: Array<{
          name: string;
          value: string;
        }>;
        image?: {
          url: string;
          altText: string | null;
        };
      };
    }>;
  };
  options: Array<{
    name: string;
    values: string[];
  }>;
  reviewRating?: {
    value: string;
  };
  reviewCount?: {
    value: string;
  };
}

const ProductDetailPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ProductNode | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductNode["variants"]["edges"][0]["node"] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [latestUnitPrice, setLatestUnitPrice] = useState<number | null>(null);
  const [latestCurrency, setLatestCurrency] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const addItem = useCartStore(state => state.addItem);
  const createCheckout = useCartStore(state => state.createCheckout);

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;

      try {
        const [productData, allProducts] = await Promise.all([
          fetchProductByHandle(handle),
          fetchProducts(5)
        ]);

        setProduct(productData);
        if (productData?.variants.edges[0]) {
          setSelectedVariant(productData.variants.edges[0].node);
        }

        // Filter out current product for related products
        const related = allProducts.filter(p => p.node.handle !== handle).slice(0, 4);
        setRelatedProducts(related);
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    setSelectedImage(0);
    setQuantity(1);
  }, [handle]);

  useEffect(() => {
    if (!product || !selectedVariant) return;

    // Fetch latest price for selected variant (defensive, updates button labels)
    const fetchLatest = async () => {
      try {
        const prices = await fetchVariantPrices([selectedVariant.id]);
        const p = prices[selectedVariant.id];
        if (p) {
          setLatestUnitPrice(parseFloat(p.amount));
          setLatestCurrency(p.currencyCode);
        } else {
          setLatestUnitPrice(parseFloat(selectedVariant.price.amount));
          setLatestCurrency(selectedVariant.price.currencyCode);
        }
      } catch (e) {
        setLatestUnitPrice(parseFloat(selectedVariant.price.amount));
        setLatestCurrency(selectedVariant.price.currencyCode);
      }
    };

    fetchLatest();

    if (selectedVariant.image?.url) {
      const imageIndex = product.images.edges.findIndex(
        edge => edge.node.url === selectedVariant.image?.url
      );

      if (imageIndex !== -1) {
        setSelectedImage(imageIndex);
      }
    }
  }, [selectedVariant, product]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const priceObj = latestUnitPrice != null && latestCurrency
      ? { amount: latestUnitPrice.toString(), currencyCode: latestCurrency }
      : selectedVariant.price;

    addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: priceObj,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
    });

    toast.success("Added to cart", {
      description: `${quantity}x ${product.title}`,
      position: "top-center",
    });
  };

  const handleBuyNow = async () => {
    if (!product || !selectedVariant) return;

    // First ensure we have the latest price for checkout
    try {
      const prices = await fetchVariantPrices([selectedVariant.id]);
      const p = prices[selectedVariant.id];
      const priceObj = p ? { amount: p.amount, currencyCode: p.currencyCode } : selectedVariant.price;

      addItem({
        product: { node: product },
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: priceObj,
        quantity,
        selectedOptions: selectedVariant.selectedOptions || [],
      });
    } catch (e) {
      // fallback to existing price
      addItem({
        product: { node: product },
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        quantity,
        selectedOptions: selectedVariant.selectedOptions || [],
      });
    }

    setIsCheckingOut(true);
    try {
      const checkoutUrl = await createCheckout();
      if (checkoutUrl) {
        // Redirecionamento na mesma aba para melhor UX Mobile
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Failed to create checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <>
        <AnnouncementBar />
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <AnnouncementBar />
        <Header />
        <div className="velora-container py-20 text-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Link to="/shop">
            <Button variant="velora-outline">Back to Shop</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const images = product.images.edges;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;
  
  // Lógica Senior de Cálculo de Preço
  const unitPrice = parseFloat(price.amount);
  const totalPrice = unitPrice * quantity;

  return (
    <>
      <Helmet>
        <title>{product.title} | MyxelHome</title>
        <meta name="description" content={product.description.slice(0, 160)} />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <main className="velora-section bg-background">
        <div className="velora-container">
          <Link 
            to="/shop" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
                {images[selectedImage]?.node ? (
                  <img
                    src={images[selectedImage].node.url}
                    alt={images[selectedImage].node.altText || product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? "border-foreground" : "border-transparent"
                      }`}
                    >
                      <img
                        src={img.node.url}
                        alt={img.node.altText || `${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="velora-heading-md mb-2">{product.title}</h1>
              
              {/* Review Rating */}
              {(() => {
                const review = parseReviewData(product);
                return review ? (
                  <div className="mb-4">
                    <StarRating rating={review.rating} count={review.ratingCount} size="md" />
                  </div>
                ) : null;
              })()}
              
              {/* Preço com Atualização Dinâmica */}
              <div className="mb-6">
                <p className="text-3xl font-semibold">
                  ${totalPrice.toFixed(2)} 
                  <span className="text-lg text-muted-foreground font-normal ml-2">USD</span>
                </p>
                {/* Mostra preço unitário apenas se quantidade > 1 para dar contexto */}
                {quantity > 1 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Preço unitário: ${unitPrice.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Variants */}
              {product.options.map((option) => {
                if (option.name === "Title" && option.values.length === 1) return null;
                
                return (
                  <div key={option.name} className="mb-6">
                    <p className="text-sm font-medium mb-3">{option.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const variant = product.variants.edges.find(
                          v => v.node.selectedOptions.some(
                            o => o.name === option.name && o.value === value
                          )
                        )?.node;
                        
                        const isSelected = selectedVariant?.selectedOptions.some(
                          o => o.name === option.name && o.value === value
                        );

                        return (
                          <button
                            key={value}
                            onClick={() => variant && setSelectedVariant(variant)}
                            disabled={!variant?.availableForSale}
                            className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                              isSelected
                                ? "border-foreground bg-foreground text-background"
                                : "border-border hover:border-foreground"
                            } ${!variant?.availableForSale ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Quantity</p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-8">
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="w-full"
                  disabled={!selectedVariant?.availableForSale || isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Buy Now — ${totalPrice.toFixed(2)}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  size="lg"
                  className="w-full"
                  disabled={!selectedVariant?.availableForSale}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {selectedVariant?.availableForSale 
                    ? `Add to Cart — $${totalPrice.toFixed(2)}` 
                    : "Out of Stock"}
                </Button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-4 p-6 bg-secondary/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Free USA Shipping</p>
                    <p className="text-xs text-muted-foreground">2-5 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">30-Day Returns</p>
                    <p className="text-xs text-muted-foreground">Risk-free guarantee</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Secure Checkout</p>
                    <p className="text-xs text-muted-foreground">Encrypted payment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Premium Quality</p>
                    <p className="text-xs text-muted-foreground">100% guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          {(product.descriptionHtml || product.description) && (
            <div className="mt-16 pt-16 border-t border-border/50">
              <h2 className="velora-heading-sm mb-6">Product Description</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {product.descriptionHtml ? (
                  <div
                    className="velora-body 
                      [&_img]:rounded-xl [&_img]:my-8 [&_img]:w-full [&_img]:max-w-xl [&_img]:mx-auto [&_img]:shadow-lg
                      [&_p]:mb-4 [&_p]:leading-relaxed
                      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2
                      [&_li]:text-muted-foreground
                      [&_strong]:text-foreground [&_strong]:font-semibold
                      [&_b]:text-foreground [&_b]:font-semibold"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                ) : (
                  <p className="velora-body whitespace-pre-line">{product.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Customer Reviews - Judge.me Widget */}
          <JudgeMeReviews productId={product.id} productTitle={product.title} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 pt-16 border-t border-border/50">
              <h2 className="velora-heading-sm mb-8">You May Also Like</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
                {relatedProducts.map((product) => (
                  <div key={product.node.id} className="flex-shrink-0 w-[280px] snap-start">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetailPage;
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
import { RealTimeProductRating } from "@/components/products/RealTimeProductRating";
import { JudgeMeReviews } from "@/components/products/JudgeMeReviews";
import { LuxuryDescription } from "@/components/products/LuxuryDescription";
import { ProductImageCarousel } from "@/components/products/ProductImageCarousel";
import { toast } from "sonner";
import { trackViewContent, trackAddToCart, trackInitiateCheckout, extractShopifyId } from "@/lib/fbPixel";

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

        // Facebook Pixel: ViewContent
        if (productData) {
          const price = parseFloat(productData.priceRange.minVariantPrice.amount);
          trackViewContent({
            content_name: productData.title,
            content_ids: [extractShopifyId(productData.id)],
            content_type: 'product',
            value: price,
            currency: productData.priceRange.minVariantPrice.currencyCode,
          });
        }

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

    // Facebook Pixel: AddToCart
    const price = latestUnitPrice ?? parseFloat(selectedVariant.price.amount);
    const currency = latestCurrency ?? selectedVariant.price.currencyCode;
    trackAddToCart({
      content_name: product.title,
      content_ids: [extractShopifyId(product.id)],
      content_type: 'product',
      value: price * quantity,
      currency,
    });

    toast.success("Added to cart", {
      description: `${quantity}x ${product.title}`,
      position: "top-center",
    });
  };

  const handleBuyNow = async () => {
    if (!product || !selectedVariant) return;

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
            <Button variant="outline">Back to Shop</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const images = product.images.edges;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;
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
        <div className="container mx-auto px-4 py-8">
          <Link 
            to="/shop" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <ProductImageCarousel
                images={images}
                productTitle={product.title}
                selectedIndex={selectedImage}
                onSelectImage={setSelectedImage}
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{product.title}</h1>
              
              {/* USO DO COMPONENTE CENTRALIZADO */}
              {/* Removemos a lógica duplicada e usamos apenas o componente que chama o Hook deduplicado */}
              <div className="mb-4">
                 {(() => {
                   const review = parseReviewData(product);
                   return (
                     <RealTimeProductRating 
                        productId={product.id}
                        handle={product.handle} 
                        initialRating={review?.rating || 0}
                        initialCount={review?.ratingCount || 0}
                        size="md"
                     />
                   );
                 })()}
              </div>
              
              <div className="mb-6">
                <p className="text-3xl font-semibold">
                  ${totalPrice.toFixed(2)} 
                  <span className="text-lg text-muted-foreground font-normal ml-2">USD</span>
                </p>
                {quantity > 1 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Preço unitário: ${unitPrice.toFixed(2)}
                  </p>
                )}
              </div>

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

          {(product.descriptionHtml || product.description) && (
            <div className="mt-20 pt-16 border-t border-border/30">
              <div className="text-center mb-12">
                <span className="text-xs font-medium uppercase tracking-[0.25em] text-accent mb-3 block">
                  Details & Specifications
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Product Description</h2>
              </div>
              
              <LuxuryDescription
                descriptionHtml={product.descriptionHtml}
                description={product.description}
                productTitle={product.title}
              />
            </div>
          )}

          <JudgeMeReviews 
            productId={product.id} 
            productTitle={product.title} 
            productHandle={product.handle} 
          />

          {relatedProducts.length > 0 && (
            <div className="mt-16 pt-16 border-t border-border/50">
              <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
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
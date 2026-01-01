import { Link } from "react-router-dom";
import { ShopifyProduct, parseReviewData } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { RealTimeProductRating } from "./RealTimeProductRating";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { node } = product;
  
  const image = node.images.edges[0]?.node;
  const firstVariant = node.variants.edges[0]?.node;
  const price = firstVariant?.price ?? node.priceRange.minVariantPrice;
  const review = parseReviewData(node);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant) return;

    addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    });

    toast.success("Added to cart", {
      description: node.title,
      position: "top-center",
    });
  };

  return (
    <article className="group">
      <Link to={`/product/${node.handle}`} className="block">
        <div className="relative aspect-[4/5] bg-secondary rounded-sm overflow-hidden mb-4">
          {image ? (
            <img
              src={image.url}
              alt={image.altText || node.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-smooth" />
          
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-smooth">
            <Button 
              onClick={handleAddToCart}
              variant="secondary"
              className="w-full bg-background/95 backdrop-blur-sm hover:bg-background"
              size="sm"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-1 group-hover:text-muted-foreground transition-colors line-clamp-2">
            {node.title}
          </h3>
          
          {/* AQUI ESTAVA FALTANDO O HANDLE NOS CARDS */}
          <div className="mb-1.5 h-4 flex items-center">
             <RealTimeProductRating 
                productId={node.id}
                handle={node.handle} // <--- ADICIONADO: Agora busca pelo nome também!
                initialRating={review?.rating || 0}
                initialCount={review?.ratingCount || 0}
             />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold">
              ${parseFloat(price.amount).toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">
              USD
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};
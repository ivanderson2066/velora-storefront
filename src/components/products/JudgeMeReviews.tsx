import { useEffect } from "react";

interface JudgeMeReviewsProps {
  productId: string;
  productTitle?: string;
}

declare global {
  interface Window {
    jdgm?: {
      SHOP_DOMAIN: string;
      PLATFORM: string;
      widget?: {
        load: () => void;
      };
    };
  }
}

export const JudgeMeReviews = ({ productId, productTitle = "" }: JudgeMeReviewsProps) => {
  // Extract numeric ID from Shopify GraphQL ID
  const numericId = productId.replace('gid://shopify/Product/', '');

  useEffect(() => {
    // Force Judge.me widget to load after component mounts
    // This fixes the race condition where the script loads before the DOM element exists
    const timer = setTimeout(() => {
      if (window.jdgm?.widget?.load) {
        window.jdgm.widget.load();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [productId, numericId]);

  return (
    <div className="mt-16 pt-16 border-t border-border/50">
      <h2 className="velora-heading-sm mb-8">Customer Reviews</h2>
      <div 
        className="jdgm-widget jdgm-review-widget" 
        data-id={numericId}
        data-product-title={productTitle}
      />
    </div>
  );
};
import { useEffect, useRef } from "react";

interface JudgeMeReviewsProps {
  productId: string;
  productTitle?: string;
}

declare global {
  interface Window {
    jdgm?: {
      SHOP_DOMAIN: string;
      PLATFORM: string;
      customWidgetRecall?: () => void;
    };
  }
}

export const JudgeMeReviews = ({ productId, productTitle = "" }: JudgeMeReviewsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Extract numeric ID from Shopify GraphQL ID
  const numericId = productId.replace('gid://shopify/Product/', '');

  useEffect(() => {
    // Force Judge.me to re-render on route change
    const timer = setTimeout(() => {
      if (window.jdgm?.customWidgetRecall) {
        window.jdgm.customWidgetRecall();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [productId, numericId]);

  return (
    <div className="mt-16 pt-16 border-t border-border/50" ref={containerRef}>
      <h2 className="velora-heading-sm mb-8">Customer Reviews</h2>
      <div 
        className="jdgm-widget jdgm-review-widget" 
        data-id={numericId}
        data-product-title={productTitle}
      />
    </div>
  );
};
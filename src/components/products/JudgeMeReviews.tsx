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
      widget?: {
        load: () => void;
      };
      customWidgetRecall?: () => void;
    };
  }
}

export const JudgeMeReviews = ({ productId, productTitle = "" }: JudgeMeReviewsProps) => {
  // Extract numeric ID from Shopify GraphQL ID
  const numericId = productId.replace('gid://shopify/Product/', '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Multiple attempts to ensure widget loads after DOM is ready
    const loadWidget = () => {
      try {
        // Try customWidgetRecall first (preferred method)
        if (typeof window.jdgm?.customWidgetRecall === 'function') {
          window.jdgm.customWidgetRecall();
          return true;
        }
        // Fallback to widget.load
        if (typeof window.jdgm?.widget?.load === 'function') {
          window.jdgm.widget.load();
          return true;
        }
      } catch (e) {
        console.warn('Judge.me widget load error:', e);
      }
      return false;
    };

    // Initial delay to ensure DOM is ready
    const timer1 = setTimeout(loadWidget, 300);
    const timer2 = setTimeout(loadWidget, 800);
    const timer3 = setTimeout(loadWidget, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [productId, numericId]);

  return (
    <div className="mt-16 pt-16 border-t border-border/50">
      <h2 className="velora-heading-sm mb-8">Customer Reviews</h2>
      <div 
        ref={containerRef}
        className="jdgm-widget jdgm-review-widget" 
        data-id={numericId}
        data-product-title={productTitle}
      />
    </div>
  );
};
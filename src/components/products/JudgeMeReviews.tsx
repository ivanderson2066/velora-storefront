import { useEffect, useRef, useState } from "react";

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
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  useEffect(() => {
    // Reset state when product changes
    setWidgetLoaded(false);
    
    // Multiple attempts to ensure widget loads after DOM is ready
    const loadWidget = () => {
      try {
        // Try customWidgetRecall first (preferred method)
        if (typeof window.jdgm?.customWidgetRecall === 'function') {
          window.jdgm.customWidgetRecall();
          setWidgetLoaded(true);
          return true;
        }
        // Fallback to widget.load
        if (typeof window.jdgm?.widget?.load === 'function') {
          window.jdgm.widget.load();
          setWidgetLoaded(true);
          return true;
        }
      } catch (e) {
        console.warn('Judge.me widget load error:', e);
      }
      return false;
    };

    // Check if jdgm object exists, if not wait for script to load
    const checkAndLoad = () => {
      if (window.jdgm) {
        loadWidget();
      }
    };

    // Initial delays to ensure DOM is ready and script is loaded
    const timer1 = setTimeout(checkAndLoad, 500);
    const timer2 = setTimeout(checkAndLoad, 1000);
    const timer3 = setTimeout(checkAndLoad, 2000);
    const timer4 = setTimeout(checkAndLoad, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [productId, numericId]);

  return (
    <div className="mt-16 pt-16 border-t border-border/50">
      <h2 className="velora-heading-sm mb-8">Customer Reviews</h2>
      
      {/* Judge.me Widget Container */}
      <div 
        ref={containerRef}
        className="jdgm-widget jdgm-review-widget" 
        data-id={numericId}
        data-product-title={productTitle}
      />
      
      {/* Fallback message if widget doesn't load */}
      {!widgetLoaded && (
        <p className="text-sm text-muted-foreground mt-4">
          Reviews are loading... If they don't appear, please refresh the page.
        </p>
      )}
    </div>
  );
};
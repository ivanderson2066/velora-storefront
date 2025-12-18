import { useEffect } from "react";

interface JudgeMeReviewsProps {
  productId: string;
}

export const JudgeMeReviews = ({ productId }: JudgeMeReviewsProps) => {
  // Extract numeric ID from Shopify GraphQL ID
  const numericId = productId.replace('gid://shopify/Product/', '');

  useEffect(() => {
    // Load Judge.me widget script
    const existingScript = document.getElementById('judgeme-widget-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'judgeme-widget-script';
      script.src = 'https://cdn.judge.me/widget_preloader.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Initialize Judge.me for this product
    const initScript = document.createElement('script');
    initScript.innerHTML = `
      window.jdgm = window.jdgm || {};
      window.jdgm.SHOP_DOMAIN = 'fwd9jn-1p.myshopify.com';
      window.jdgm.PLATFORM = 'shopify';
      window.jdgm.PUBLIC_TOKEN = '';
    `;
    document.head.appendChild(initScript);

    return () => {
      initScript.remove();
    };
  }, [productId]);

  return (
    <div className="mt-16 pt-16 border-t border-border/50">
      <h2 className="velora-heading-sm mb-8">Customer Reviews</h2>
      <div 
        className="jdgm-widget jdgm-review-widget" 
        data-id={numericId}
        data-product-title=""
      />
    </div>
  );
};
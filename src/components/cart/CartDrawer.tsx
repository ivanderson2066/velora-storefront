import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    items, 
    isLoading, 
    updateQuantity, 
    removeItem, 
    createCheckout,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();
  const syncPrices = useCartStore(state => state.syncPrices);
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const subtotalCurrency = items.length > 0
    ? (items[0].product.node.variants?.edges?.find(v => v.node.id === items[0].variantId)?.node?.price?.currencyCode ?? items[0].price.currencyCode)
    : 'USD';

  const handleCheckout = async () => {
    try {
      const checkoutUrl = await createCheckout();
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
        setIsOpen(false);
      } else {
        toast.error("Failed to create checkout");
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error("Checkout failed. Please try again.");
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    try {
      // do not await to avoid blocking UI render; errors are logged inside
      void syncPrices();
    } catch (err) {
      console.error('syncPrices trigger failed:', err);
    }
  }, [isOpen, syncPrices]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="text-lg tracking-wide">Shopping Cart</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {(() => {
                    try {
                      return items.map((item) => (
                        <div key={item.variantId} className="flex gap-4 p-3 bg-secondary/30 rounded-sm">
                          <div className="w-20 h-20 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                            {item.product.node.images?.edges?.[0]?.node && (
                              <img
                                src={item.product.node.images.edges[0].node.url}
                                alt={item.product.node.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{item.product.node.title}</h4>
                            {item.variantTitle !== "Default Title" && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.variantTitle}
                              </p>
                            )}
                            <p className="text-sm font-medium mt-1">
                              {(() => {
                                const variant = item.product.node.variants?.edges?.find(v => v.node.id === item.variantId)?.node;
                                const amount = variant?.price?.amount ?? item.price.amount;
                                const currency = variant?.price?.currencyCode ?? item.price.currencyCode;
                                return `${currency} ${parseFloat(amount).toFixed(2)}`;
                              })()}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {(() => {
                                const variant = item.product.node.variants?.edges?.find(v => v.node.id === item.variantId)?.node;
                                const amount = parseFloat(variant?.price?.amount ?? item.price.amount);
                                const currency = variant?.price?.currencyCode ?? item.price.currencyCode;
                                const total = amount * item.quantity;
                                return `${currency} ${total.toFixed(2)} total`;
                              })()}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center text-sm">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => removeItem(item.variantId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ));
                    } catch (err) {
                      console.error('Error rendering cart items:', err);
                      return (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                          Ocorreu um erro ao renderizar o carrinho. Atualize a página ou tente novamente.
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
              
              <div className="flex-shrink-0 space-y-4 pt-6 border-t border-border/50 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-medium">
                    {subtotalCurrency} {totalPrice.toFixed(2)}
                  </span>
                </div>
                
                <Button 
                  onClick={handleCheckout}
                  className="w-full" 
                  size="lg"
                  disabled={items.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Checkout
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Secure checkout powered by Shopify
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

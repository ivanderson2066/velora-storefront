import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct, createStorefrontCheckout, fetchVariantPrices } from '@/lib/shopify';

export interface CartItem {
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  quantity: number;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  createCheckout: () => Promise<string | null>;
  syncPrices: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(i => i.variantId === item.variantId);
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      // Sync prices with Shopify for all items currently in cart
      syncPrices: async () => {
        const { items, setLoading } = get();
        if (items.length === 0) return;

        setLoading(true);
        try {
          const ids = items.map(i => i.variantId);
          const prices = await fetchVariantPrices(ids);

          set({
            items: get().items.map(item => {
              const latest = prices[item.variantId];
              if (latest) {
                return {
                  ...item,
                  price: {
                    amount: latest.amount,
                    currencyCode: latest.currencyCode,
                  }
                };
              }
              return item;
            })
          });
        } catch (e) {
          console.error('Failed to sync prices:', e);
        } finally {
          setLoading(false);
        }
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.variantId === variantId ? { ...item, quantity } : item
          )
        });
      },

      removeItem: (variantId) => {
        set({
          items: get().items.filter(item => item.variantId !== variantId)
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      setLoading: (isLoading) => set({ isLoading }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => {
          try {
            const variant = item.product.node.variants?.edges?.find(v => v.node.id === item.variantId)?.node;
            const amount = variant?.price?.amount ?? item.price.amount;
            return sum + (parseFloat(amount) * item.quantity);
          } catch (e) {
            return sum + (parseFloat(item.price.amount) * item.quantity);
          }
        }, 0);
      },

      createCheckout: async () => {
        const { items, setLoading } = get();
        if (items.length === 0) return null;

        setLoading(true);
        try {
          const checkoutUrl = await createStorefrontCheckout(
            items.map(item => ({ variantId: item.variantId, quantity: item.quantity }))
          );
          return checkoutUrl;
        } catch (error) {
          console.error('Failed to create checkout:', error);
          return null;
        } finally {
          setLoading(false);
        }
      }
    }),
    {
      name: 'velora-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct, createStorefrontCheckout, fetchVariantPrices } from '@/lib/shopify';
const memoryStore: Record<string, string> = {};
const safeStorage = (): Storage => {
  return {
    getItem: (name: string) => {
      try {
        return localStorage.getItem(name);
      } catch {
        try {
          return sessionStorage.getItem(name);
        } catch {
          return memoryStore[name] ?? null;
        }
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value);
      } catch {
        try {
          sessionStorage.setItem(name, value);
        } catch {
          memoryStore[name] = value;
        }
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
      } catch {}
      try {
        sessionStorage.removeItem(name);
      } catch {}
      try {
        delete memoryStore[name];
      } catch {}
    },
    clear: () => {
      try {
        localStorage.clear();
      } catch {}
      try {
        sessionStorage.clear();
      } catch {}
      for (const k of Object.keys(memoryStore)) {
        delete memoryStore[k];
      }
    },
    key: (_index: number) => null,
    length: 0,
  } as Storage;
};

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
        return get().items.reduce((sum, item) => sum + (item?.quantity || 0), 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => {
          try {
            if (!item) return sum;
            const variant = item.product?.node?.variants?.edges?.find(v => v?.node?.id === item.variantId)?.node;
            const amount = variant?.price?.amount ?? item.price?.amount ?? '0';
            return sum + (parseFloat(amount) * (item.quantity || 0));
          } catch (e) {
            console.error('Error calculating total price for item:', item, e);
            const amount = item?.price?.amount ?? '0';
            return sum + (parseFloat(amount) * (item?.quantity || 0));
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
      storage: createJSONStorage(() => safeStorage()),
      version: 1,
      migrate: (persistedState: unknown, version) => {
        if (version !== 1) {
          return { items: [], isLoading: false } as CartStore;
        }
        const state = persistedState as unknown as Partial<CartStore> | null;
        const items = state && Array.isArray(state.items) ? state.items : [];
        const sanitizedItems = items.filter((i): i is CartItem => {
          if (i == null) return false;
          if (typeof i !== 'object') return false;
          const obj = i as unknown as { [key: string]: unknown };
          const price = obj.price as { amount?: unknown; currencyCode?: unknown } | undefined;
          return (
            typeof obj['variantId'] === 'string' &&
            typeof obj['quantity'] === 'number' &&
            !!price &&
            typeof price.amount === 'string' &&
            typeof price.currencyCode === 'string' &&
            typeof obj['product'] === 'object'
          );
        });
        return { items: sanitizedItems, isLoading: false } as CartStore;
      },
      // Persist full state; functions are ignored by JSON.stringify
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          try {
            localStorage.removeItem('velora-cart');
          } catch (e) {
            console.error('Failed to clean corrupted cart state:', e);
          }
        }
      },
    }
  )
);

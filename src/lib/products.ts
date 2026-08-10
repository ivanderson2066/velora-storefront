import { supabase } from "@/integrations/supabase/client";

export interface ProductReview {
  rating: number;
  ratingCount: number;
}

export interface StoreProduct {
  node: {
    id: string;
    title: string;
    description: string;
    descriptionHtml?: string;
    handle: string;
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    images: {
      edges: Array<{ node: { url: string; altText: string | null } }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
          image?: { url: string; altText: string | null };
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
    reviewRating?: { value: string };
    reviewCount?: { value: string };
  };
}

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  image_url: string | null;
};

function toStoreProduct(product: ProductRow): StoreProduct {
  const amount = (product.price_cents / 100).toFixed(2);
  const currencyCode = (product.currency || "usd").toUpperCase();
  const handle = product.id;
  const images = product.image_url
    ? { edges: [{ node: { url: product.image_url, altText: product.name } }] }
    : { edges: [] };

  return {
    node: {
      id: product.id,
      title: product.name,
      description: product.description ?? "",
      descriptionHtml: product.description ?? "",
      handle,
      priceRange: { minVariantPrice: { amount, currencyCode } },
      images,
      variants: {
        edges: [{
          node: {
            id: product.id,
            title: "Default Title",
            price: { amount, currencyCode },
            availableForSale: true,
            selectedOptions: [],
          },
        }],
      },
      options: [],
    },
  };
}

export async function fetchProducts(limit = 50, search?: string): Promise<StoreProduct[]> {
  let query = supabase
    .from("products")
    .select("id,name,description,price_cents,currency,image_url")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (search?.trim()) {
    const safeSearch = search.replace(/[%_,()]/g, " ").trim();
    if (safeSearch) query = query.or(`name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Unable to load products: ${error.message}`);
  return (data ?? []).map(toStoreProduct);
}

export async function fetchProductByHandle(handle: string) {
  const id = handle.replace(/^local-(variant-)?/, "");
  const { data, error } = await supabase
    .from("products")
    .select("id,name,description,price_cents,currency,image_url")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (error) throw new Error(`Unable to load product: ${error.message}`);
  return data ? toStoreProduct(data).node : null;
}

export function parseReviewData(product: StoreProduct["node"]): ProductReview | null {
  if (!product.reviewRating?.value || !product.reviewCount?.value) return null;
  try {
    const parsed = JSON.parse(product.reviewRating.value) as { value?: number };
    const ratingCount = Number.parseInt(product.reviewCount.value, 10) || 0;
    return ratingCount > 0 ? { rating: parsed.value ?? 0, ratingCount } : null;
  } catch {
    return null;
  }
}

export async function fetchVariantPrices(ids: string[]) {
  const result: Record<string, { amount: string; currencyCode: string }> = {};
  if (ids.length === 0) return result;

  const productIds = ids.map((id) => id.replace(/^local-(variant-)?/, ""));
  const { data, error } = await supabase
    .from("products")
    .select("id,price_cents,currency")
    .in("id", productIds)
    .eq("active", true);
  if (error) throw new Error(`Unable to refresh prices: ${error.message}`);

  for (const product of data ?? []) {
    const price = {
      amount: (product.price_cents / 100).toFixed(2),
      currencyCode: (product.currency || "usd").toUpperCase(),
    };
    result[product.id] = price;
    result[`local-${product.id}`] = price;
    result[`local-variant-${product.id}`] = price;
  }
  return result;
}
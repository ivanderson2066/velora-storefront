import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'fwd9jn-1p.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'b0159fe69afa12edfae41b61b04553f5';
const SHOPIFY_DEFAULT_COUNTRY = (import.meta.env.VITE_SHOPIFY_DEFAULT_COUNTRY as string | undefined) || 'US';

export interface ProductReview {
  rating: number;
  ratingCount: number;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    descriptionHtml?: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
          image?: {
            url: string;
            altText: string | null;
          };
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
    reviewRating?: {
      value: string;
    };
    reviewCount?: {
      value: string;
    };
  };
}

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description: "Your store needs to be upgraded to a paid plan.",
    });
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return data;
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          descriptionHtml
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
                image {
                  url
                  altText
                }
              }
            }
          }
          options {
            name
            values
          }
          reviewRating: metafield(namespace: "reviews", key: "rating") {
            value
          }
          reviewCount: metafield(namespace: "reviews", key: "rating_count") {
            value
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      descriptionHtml
      handle
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
            }
          }
        }
      }
      options {
        name
        values
      }
      reviewRating: metafield(namespace: "reviews", key: "rating") {
        value
      }
      reviewCount: metafield(namespace: "reviews", key: "rating_count") {
        value
      }
    }
  }
`;

// Helper to parse Judge.me review data
export function parseReviewData(product: ShopifyProduct['node'] | { reviewRating?: { value: string }; reviewCount?: { value: string } }): ProductReview | null {
  if (!product.reviewRating?.value || !product.reviewCount?.value) {
    return null;
  }
  
  try {
    const ratingData = JSON.parse(product.reviewRating.value);
    const rating = ratingData.value || 0;
    const ratingCount = parseInt(product.reviewCount.value) || 0;
    
    if (ratingCount === 0) return null;
    
    return { rating, ratingCount };
  } catch {
    return null;
  }
}

function localToShopifyProduct(p: {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  image_url: string | null;
}): ShopifyProduct {
  const amount = (p.price_cents / 100).toFixed(2);
  const currencyCode = (p.currency || "USD").toUpperCase();
  const handle = `local-${p.id}`;
  const variantId = `local-variant-${p.id}`;
  const images = p.image_url
    ? { edges: [{ node: { url: p.image_url, altText: p.name } }] }
    : { edges: [] };
  return {
    node: {
      id: `local-${p.id}`,
      title: p.name,
      description: p.description ?? "",
      descriptionHtml: p.description ?? "",
      handle,
      priceRange: { minVariantPrice: { amount, currencyCode } },
      images,
      variants: {
        edges: [{
          node: {
            id: variantId,
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

async function fetchLocalProducts(limit: number): Promise<ShopifyProduct[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,description,price_cents,currency,image_url")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map(localToShopifyProduct);
  } catch {
    return [];
  }
}

export async function fetchProducts(first: number = 50, query?: string): Promise<ShopifyProduct[]> {
  try {
    const data = await storefrontApiRequest(PRODUCTS_QUERY, { first, query });
    const shopifyProducts: ShopifyProduct[] = data?.data?.products?.edges ?? [];
    if (shopifyProducts.length > 0) return shopifyProducts;
  } catch (e) {
    console.warn("Shopify fetch failed, falling back to local products:", e);
  }
  return await fetchLocalProducts(first);
}

export async function fetchProductByHandle(handle: string) {
  if (handle.startsWith("local-")) {
    const id = handle.replace(/^local-/, "");
    const { data } = await supabase
      .from("products")
      .select("id,name,description,price_cents,currency,image_url")
      .eq("id", id)
      .eq("active", true)
      .maybeSingle();
    if (!data) return null;
    return localToShopifyProduct(data).node;
  }
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  if (!data) return null;
  return data.data.productByHandle;
}

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createStorefrontCheckout(items: Array<{ variantId: string; quantity: number }>): Promise<string> {
  const lines = items.map(item => ({
    quantity: item.quantity,
    merchandiseId: item.variantId,
  }));

  const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { 
      lines,
      buyerIdentity: { countryCode: SHOPIFY_DEFAULT_COUNTRY },
    },
  });

  if (!cartData) {
    throw new Error('Failed to create cart');
  }

  if (cartData.data.cartCreate.userErrors.length > 0) {
    throw new Error(`Cart creation failed: ${cartData.data.cartCreate.userErrors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  const cart = cartData.data.cartCreate.cart;
  
  if (!cart.checkoutUrl) {
    throw new Error('No checkout URL returned from Shopify');
  }

  const url = new URL(cart.checkoutUrl);
  url.searchParams.set('channel', 'online_store');
  return url.toString();
}

// Shop Policies Query
const SHOP_POLICIES_QUERY = `
  query GetShopPolicies {
    shop {
      privacyPolicy {
        body
        title
        handle
      }
      refundPolicy {
        body
        title
        handle
      }
      shippingPolicy {
        body
        title
        handle
      }
      termsOfService {
        body
        title
        handle
      }
    }
  }
`;

export interface ShopPolicy {
  body: string;
  title: string;
  handle: string;
}

export interface ShopPolicies {
  privacyPolicy: ShopPolicy | null;
  refundPolicy: ShopPolicy | null;
  shippingPolicy: ShopPolicy | null;
  termsOfService: ShopPolicy | null;
}

export async function fetchShopPolicies(): Promise<ShopPolicies | null> {
  const data = await storefrontApiRequest(SHOP_POLICIES_QUERY);
  if (!data) return null;
  return data.data.shop;
}

// Fetch prices for given variant IDs (GraphQL node lookup)
export async function fetchVariantPrices(variantIds: string[]): Promise<Record<string, { amount: string; currencyCode: string }>> {
  if (variantIds.length === 0) return {};

  const VARIANT_QUERY = `
    query GetVariants($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on ProductVariant {
          id
          priceV2 {
            amount
            currencyCode
          }
        }
      }
    }
  `;

  const data = await storefrontApiRequest(VARIANT_QUERY, { ids: variantIds });
  if (!data) return {};

  const result: Record<string, { amount: string; currencyCode: string }> = {};
  for (const node of data.data.nodes) {
    if (!node) continue;
    if (node.id && node.priceV2) {
      result[node.id] = { amount: node.priceV2.amount, currencyCode: node.priceV2.currencyCode };
    }
  }

  return result;
}

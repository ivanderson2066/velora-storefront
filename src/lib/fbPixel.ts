/**
 * Facebook Pixel Integration
 * 
 * Este módulo gerencia o Facebook Pixel para rastreamento de eventos e-commerce.
 * 
 * IMPORTANTE: Configure seu Pixel ID abaixo antes de usar.
 */

// ============================================
// ⚠️ CONFIGURE SEU PIXEL ID AQUI ⚠️
// ============================================
const FB_PIXEL_ID = 'YOUR_PIXEL_ID_HERE'; // Substitua pelo seu Pixel ID real
// ============================================

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

/**
 * Inicializa o Facebook Pixel
 * Deve ser chamado uma vez quando o app carregar
 */
export function initFacebookPixel(): void {
  if (FB_PIXEL_ID === 'YOUR_PIXEL_ID_HERE') {
    console.warn('[Facebook Pixel] Pixel ID não configurado. Edite src/lib/fbPixel.ts');
    return;
  }

  if (typeof window === 'undefined') return;

  // Evita inicialização dupla
  if (window.fbq) return;

  // Facebook Pixel base code
  const f = window as Window;
  const n = function (...args: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (n as any).callMethod
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (n as any).callMethod.apply(n, args)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : (n as any).queue.push(args);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (n as any).push = n;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (n as any).loaded = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (n as any).version = '2.0';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (n as any).queue = [];
  f.fbq = n;

  // Carrega o script do Facebook Pixel
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  // Inicializa o pixel
  window.fbq('init', FB_PIXEL_ID);
  window.fbq('track', 'PageView');

  console.log('[Facebook Pixel] Inicializado com sucesso');
}

/**
 * Verifica se o Pixel está configurado e ativo
 */
function isPixelReady(): boolean {
  return FB_PIXEL_ID !== 'YOUR_PIXEL_ID_HERE' && typeof window !== 'undefined' && !!window.fbq;
}

/**
 * Rastreia visualização de página
 * Chamado automaticamente em mudanças de rota
 */
export function trackPageView(): void {
  if (!isPixelReady()) return;
  window.fbq('track', 'PageView');
}

/**
 * Rastreia visualização de conteúdo (produto)
 */
export function trackViewContent(params: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
}): void {
  if (!isPixelReady()) return;
  window.fbq('track', 'ViewContent', params);
}

/**
 * Rastreia adição ao carrinho
 */
export function trackAddToCart(params: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
}): void {
  if (!isPixelReady()) return;
  window.fbq('track', 'AddToCart', params);
}

/**
 * Rastreia início do checkout
 */
export function trackInitiateCheckout(params: {
  content_ids: string[];
  contents: Array<{ id: string; quantity: number }>;
  num_items: number;
  value: number;
  currency: string;
}): void {
  if (!isPixelReady()) return;
  window.fbq('track', 'InitiateCheckout', params);
}

/**
 * Rastreia compra concluída
 */
export function trackPurchase(params: {
  content_ids: string[];
  contents: Array<{ id: string; quantity: number }>;
  num_items: number;
  value: number;
  currency: string;
}): void {
  if (!isPixelReady()) return;
  window.fbq('track', 'Purchase', params);
}

/**
 * Rastreia pesquisa
 */
export function trackSearch(searchString: string): void {
  if (!isPixelReady()) return;
  window.fbq('track', 'Search', { search_string: searchString });
}

/**
 * Rastreia lead (contato)
 */
export function trackLead(): void {
  if (!isPixelReady()) return;
  window.fbq('track', 'Lead');
}

/**
 * Rastreia registro completo
 */
export function trackCompleteRegistration(): void {
  if (!isPixelReady()) return;
  window.fbq('track', 'CompleteRegistration');
}

/**
 * Rastreia evento customizado
 */
export function trackCustomEvent(eventName: string, params?: Record<string, unknown>): void {
  if (!isPixelReady()) return;
  window.fbq('trackCustom', eventName, params);
}

/**
 * Extrai o ID numérico do Shopify de um GID
 */
export function extractShopifyId(gid: string): string {
  // gid://shopify/Product/123456 -> 123456
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : gid;
}

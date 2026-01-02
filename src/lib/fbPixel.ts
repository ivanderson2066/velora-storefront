/**
 * Facebook Pixel Integration
 * 
 * Este módulo gerencia o Facebook Pixel para rastreamento de eventos e-commerce.
 */

// ============================================
// PIXEL ID CONFIGURADO
// ============================================
const FB_PIXEL_ID = '1936344623982424';
// ============================================

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

let pixelInitialized = false;

/**
 * Inicializa o Facebook Pixel
 * Deve ser chamado uma vez quando o app carregar
 */
export function initFacebookPixel(): void {
  try {
    if (!FB_PIXEL_ID) {
      return;
    }

    if (typeof window === 'undefined') return;

    // Evita inicialização dupla
    if (pixelInitialized || window.fbq) {
      console.log('[Facebook Pixel] Já inicializado, pulando...');
      return;
    }

    pixelInitialized = true;

    // Facebook Pixel base code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const n: any = function (...args: unknown[]) {
      if (n.callMethod) {
        n.callMethod.apply(n, args);
      } else {
        n.queue.push(args);
      }
    };
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    window.fbq = n;

    // Carrega o script do Facebook Pixel
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.onerror = () => {
      console.warn('[Facebook Pixel] Falha ao carregar script');
    };
    document.head.appendChild(script);

    // Inicializa o pixel
    window.fbq('init', FB_PIXEL_ID);
    window.fbq('track', 'PageView');

    console.log('[Facebook Pixel] Inicializado com sucesso');
  } catch (error) {
    console.warn('[Facebook Pixel] Erro na inicialização:', error);
  }
}

/**
 * Verifica se o Pixel está configurado e ativo
 */
function isPixelReady(): boolean {
  try {
    return !!FB_PIXEL_ID && typeof window !== 'undefined' && typeof window.fbq === 'function';
  } catch {
    return false;
  }
}

/**
 * Executa chamada do pixel com segurança
 */
function safePixelCall(callback: () => void): void {
  try {
    if (isPixelReady()) {
      callback();
    }
  } catch (error) {
    console.warn('[Facebook Pixel] Erro ao rastrear evento:', error);
  }
}

/**
 * Rastreia visualização de página
 * Chamado automaticamente em mudanças de rota
 */
export function trackPageView(): void {
  safePixelCall(() => {
    window.fbq?.('track', 'PageView');
  });
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
  safePixelCall(() => {
    window.fbq?.('track', 'ViewContent', params);
  });
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
  safePixelCall(() => {
    window.fbq?.('track', 'AddToCart', params);
  });
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
  safePixelCall(() => {
    window.fbq?.('track', 'InitiateCheckout', params);
  });
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
  safePixelCall(() => {
    window.fbq?.('track', 'Purchase', params);
  });
}

/**
 * Rastreia pesquisa
 */
export function trackSearch(searchString: string): void {
  safePixelCall(() => {
    window.fbq?.('track', 'Search', { search_string: searchString });
  });
}

/**
 * Rastreia lead (contato)
 */
export function trackLead(): void {
  safePixelCall(() => {
    window.fbq?.('track', 'Lead');
  });
}

/**
 * Rastreia registro completo
 */
export function trackCompleteRegistration(): void {
  safePixelCall(() => {
    window.fbq?.('track', 'CompleteRegistration');
  });
}

/**
 * Rastreia evento customizado
 */
export function trackCustomEvent(eventName: string, params?: Record<string, unknown>): void {
  safePixelCall(() => {
    window.fbq?.('trackCustom', eventName, params);
  });
}

/**
 * Extrai o ID numérico do Shopify de um GID
 */
export function extractShopifyId(gid: string): string {
  try {
    const match = gid.match(/\/(\d+)$/);
    return match ? match[1] : gid;
  } catch {
    return gid;
  }
}

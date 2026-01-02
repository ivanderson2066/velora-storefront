import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initFacebookPixel, trackPageView } from '@/lib/fbPixel';

/**
 * Hook para inicializar e gerenciar o Facebook Pixel
 * 
 * Deve ser usado no componente raiz (App.tsx)
 * Rastreia automaticamente mudanças de página
 */
export function useFacebookPixel(): void {
  const location = useLocation();

  // Inicializa o Pixel uma vez
  useEffect(() => {
    initFacebookPixel();
  }, []);

  // Rastreia mudanças de página
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);
}

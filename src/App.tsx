import { useEffect, useState } from "react";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { Button } from "@/components/ui/button";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CollectionsPage from "./pages/CollectionsPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import PolicyPage from "./pages/PolicyPage";
import TermsPage from "./pages/TermsPage";
import { Navigate } from "react-router-dom";
import FAQPage from "./pages/FAQPage";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; msg?: string; stack?: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, msg: undefined, stack: undefined };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    const stack = error instanceof Error ? error.stack : undefined;
    this.setState({ msg, stack });
    try {
      console.error('Runtime error', { error, info: errorInfo });
    } catch {}
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">Ocorreu um erro inesperado.</p>
            <p className="text-sm text-muted-foreground mt-1">Atualize a página e tente novamente.</p>
            {this.state.msg && (
              <p className="text-xs text-muted-foreground mt-2">{this.state.msg}</p>
            )}
            <div className="mt-4 flex gap-2 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Recarregar
              </Button>
              <Button
                onClick={() => {
                  try {
                    localStorage.removeItem('velora-cart');
                  } catch {}
                  try {
                    sessionStorage.removeItem('velora-cart');
                  } catch {}
                  window.location.reload();
                }}
              >
                Resetar carrinho
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    try {
      if (typeof document !== "undefined" && !document.getElementById("radix-portal-root")) {
        const el = document.createElement("div");
        el.id = "radix-portal-root";
        document.body.appendChild(el);
      }
      const val = localStorage.getItem("velora-cookie-consent");
      setShowConsent(val !== "accepted");
    } catch {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.setItem("velora-cookie-consent", "accepted");
    } catch {}
    setShowConsent(false);
  };

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:handle" element={<ProductDetailPage />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/collections/:collectionId" element={<CollectionsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/privacy" element={<PolicyPage />} />
                <Route path="/refunds" element={<PolicyPage />} />
                <Route path="/shipping" element={<PolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/terms-of-service" element={<TermsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>

              {showConsent && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-[640px] rounded-lg border bg-background shadow-lg p-4">
                  <p className="text-sm">
                    Usamos cookies e armazenamento local para garantir o funcionamento do carrinho e do checkout.
                  </p>
                  <div className="mt-3 flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowConsent(false)}>
                      Agora não
                    </Button>
                    <Button onClick={acceptCookies}>
                      Aceitar cookies
                    </Button>
                  </div>
                </div>
              )}
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;

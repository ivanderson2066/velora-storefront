import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
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

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

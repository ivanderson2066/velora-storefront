import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Locale = "en" | "pt";

type Dict = Record<string, string>;

const dictionaries: Record<Locale, Dict> = {
  en: {
    "nav.shop": "Shop",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.admin": "Admin",
    "shop.title": "Our Products",
    "shop.empty": "No products available yet.",
    "shop.buy": "Buy now",
    "shop.loading": "Loading…",
    "admin.title": "Admin · Products",
    "admin.signin": "Sign in",
    "admin.signup": "Create account",
    "admin.email": "Email",
    "admin.password": "Password",
    "admin.signout": "Sign out",
    "admin.new": "New product",
    "admin.name": "Name",
    "admin.description": "Description",
    "admin.price": "Price (USD)",
    "admin.image": "Image URL",
    "admin.active": "Active",
    "admin.save": "Save",
    "admin.cancel": "Cancel",
    "admin.edit": "Edit",
    "admin.delete": "Delete",
    "admin.no_access": "You are signed in but do not have admin access.",
    "admin.image_file": "Product image",
    "admin.uploading": "Uploading…",
    "admin.replace_image": "Replace image",
    "checkout.success": "Payment successful",
    "checkout.success_msg": "Thank you for your purchase!",
    "checkout.cancel": "Payment cancelled",
    "checkout.cancel_msg": "Your payment was cancelled. No charges were made.",
    "checkout.back": "Back to home",
    "lang.label": "Language",
  },
  pt: {
    "nav.shop": "Loja",
    "nav.about": "Sobre",
    "nav.contact": "Contato",
    "nav.admin": "Admin",
    "shop.title": "Nossos Produtos",
    "shop.empty": "Nenhum produto disponível ainda.",
    "shop.buy": "Comprar agora",
    "shop.loading": "Carregando…",
    "admin.title": "Admin · Produtos",
    "admin.signin": "Entrar",
    "admin.signup": "Criar conta",
    "admin.email": "E-mail",
    "admin.password": "Senha",
    "admin.signout": "Sair",
    "admin.new": "Novo produto",
    "admin.name": "Nome",
    "admin.description": "Descrição",
    "admin.price": "Preço (USD)",
    "admin.image": "URL da imagem",
    "admin.active": "Ativo",
    "admin.save": "Salvar",
    "admin.cancel": "Cancelar",
    "admin.edit": "Editar",
    "admin.delete": "Excluir",
    "admin.no_access": "Você está logado, mas não tem permissão de admin.",
    "admin.image_file": "Imagem do produto",
    "admin.uploading": "Enviando…",
    "admin.replace_image": "Trocar imagem",
    "checkout.success": "Pagamento concluído",
    "checkout.success_msg": "Obrigado pela sua compra!",
    "checkout.cancel": "Pagamento cancelado",
    "checkout.cancel_msg": "Seu pagamento foi cancelado. Nenhuma cobrança foi feita.",
    "checkout.back": "Voltar ao início",
    "lang.label": "Idioma",
  },
};

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nCtx | null>(null);

const STORAGE_KEY = "app-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "en" || saved === "pt") setLocaleState(saved);
    } catch {}
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
    document.documentElement.lang = l === "pt" ? "pt-BR" : "en";
  };

  const t = (key: string) => dictionaries[locale][key] ?? key;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

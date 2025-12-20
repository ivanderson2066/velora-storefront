import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Usar '127.0.0.1' força o IPv4 local explícito.
    // Isso resolve a lentidão de DNS e garante que o navegador conecte instantaneamente.
    host: "127.0.0.1", 
    port: 5173,
    open: true, // Abre o navegador automaticamente
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
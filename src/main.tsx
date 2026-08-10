import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Silence cross-origin "Script error." noise from third-party widgets (e.g. Judge.me)
// These are unhandled errors from external scripts that we cannot fix and that don't affect the app.
const isThirdPartyError = (src?: string | null, msg?: string) => {
  if (!src && (!msg || msg === "Script error.")) return true;
  if (src && /judge\.me|cdn\.judge\.me/i.test(src)) return true;
  return false;
};

window.addEventListener(
  "error",
  (e) => {
    if (isThirdPartyError(e.filename, e.message)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  },
  true,
);

window.addEventListener("unhandledrejection", (e) => {
  const reason = e.reason as unknown;
  const msg = reason instanceof Error ? reason.message : String(reason ?? "");
  if (/judge\.me|jdgmSettings|Script error/i.test(msg)) {
    e.preventDefault();
  }
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Application root element was not found");
}
try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Application failed to start", error);
  rootElement.innerHTML = '<main style="padding:2rem;text-align:center;font-family:system-ui,sans-serif"><h1>Unable to load MyxelHome</h1><p>Please refresh the page and try again.</p><button type="button" onclick="window.location.reload()" style="padding:.75rem 1rem;cursor:pointer">Reload</button></main>';
}

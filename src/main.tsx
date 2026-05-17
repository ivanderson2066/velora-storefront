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

createRoot(document.getElementById("root")!).render(<App />);

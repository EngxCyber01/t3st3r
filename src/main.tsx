import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Self-heal a stale cached page: if a lazily-loaded chunk fails to load (e.g. an
// old index.html cached by the browser references chunks a new deploy purged),
// reload ONCE to fetch the fresh assets. Guarded so it can never loop.
window.addEventListener("vite:preloadError", () => {
  try {
    if (!sessionStorage.getItem("pt.reloadedOnce")) {
      sessionStorage.setItem("pt.reloadedOnce", "1");
      window.location.reload();
    }
  } catch {
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter
      // Works both locally (base "/") and on GitHub Pages (base "/t3st3r/").
      basename={import.meta.env.BASE_URL.replace(/\/$/, "")}
      future={{
        // Opt into v7 behavior now — silences the console future-flag warnings.
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

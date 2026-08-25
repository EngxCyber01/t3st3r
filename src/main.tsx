import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

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

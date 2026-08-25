import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// GitHub Pages serves a project repo under /<repo>/, so the production build is
// based at /t3st3r/. Local dev/preview stay at / for convenience.
export default defineConfig(({ command }) => {
  const base = command === "build" ? "/t3st3r/" : "/";
  return {
    base,
    plugins: [
      react(),
      // Offline mode (PWA). The app is fully client-side, so precaching the
      // build assets makes the whole thing work with no network. Silent
      // auto-update — no UI is added, the design is unchanged.
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: ["icon.svg"],
        manifest: {
          name: "T3st3r",
          short_name: "T3st3r",
          description:
            "Interactive penetration-testing teacher, decision engine & command reference for authorized labs.",
          theme_color: "#080b11",
          background_color: "#080b11",
          display: "standalone",
          orientation: "any",
          icons: [
            { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
            { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,ico,png,woff,woff2}"],
          // SPA offline routing: serve the app shell for any navigation.
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
          // Take control of pages as soon as the SW activates so we consistently
          // serve the (self-consistent) precache instead of the browser's flaky
          // HTTP cache. skipWaiting stays OFF, so a NEW version is fetched in the
          // background and only applied on the next fresh open — an already-open
          // tab never breaks on a hashed-chunk mismatch after a redeploy.
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-stylesheets",
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        // No service worker during local dev (avoids caching surprises while coding).
        devOptions: { enabled: false },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
    },
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            motion: ["framer-motion"],
            icons: ["lucide-react"],
          },
        },
      },
    },
  };
});

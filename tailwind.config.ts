import type { Config } from "tailwindcss";

/**
 * Design system for the Pentest Teacher.
 * Colors are declared as space-separated RGB channels in CSS variables
 * (see src/index.css) so Tailwind's `/<alpha-value>` opacity modifier works:
 *   bg-surface/60, text-fg/70, border-line/40, etc.
 */
const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Layered surfaces (deepest -> raised)
        base: withOpacity("--c-base"),
        surface: withOpacity("--c-surface"),
        "surface-2": withOpacity("--c-surface-2"),
        raised: withOpacity("--c-raised"),
        line: withOpacity("--c-line"),
        "line-strong": withOpacity("--c-line-strong"),

        // Text
        fg: withOpacity("--c-fg"),
        muted: withOpacity("--c-muted"),
        subtle: withOpacity("--c-subtle"),

        // Brand / accent
        primary: withOpacity("--c-primary"),
        "primary-fg": withOpacity("--c-primary-fg"),
        "primary-soft": withOpacity("--c-primary-soft"),

        // Semantic (spec §73)
        info: withOpacity("--c-info"),
        success: withOpacity("--c-success"),
        caution: withOpacity("--c-caution"),
        elevated: withOpacity("--c-elevated"),
        critical: withOpacity("--c-critical"),
        teacher: withOpacity("--c-teacher"),
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgb(255 255 255 / 0.03) inset, 0 12px 32px -12px rgb(0 0 0 / 0.6)",
        glow: "0 0 0 1px rgb(var(--c-primary) / 0.25), 0 0 24px -6px rgb(var(--c-primary) / 0.35)",
        card: "0 1px 2px rgb(0 0 0 / 0.25), 0 8px 24px -16px rgb(0 0 0 / 0.5)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.24s ease-out",
        "scale-in": "scale-in 0.18s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;

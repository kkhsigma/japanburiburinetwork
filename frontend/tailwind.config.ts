import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0a1628",
          50: "#e8ecf2",
          100: "#c5cdd9",
          200: "#9baabe",
          300: "#7187a3",
          400: "#4d6585",
          500: "#2d4466",
          600: "#1a2d4a",
          700: "#0f1f38",
          800: "#0a1628",
          900: "#050b14",
        },
        accent: {
          green: "#3a7d44",
          "green-light": "#4a9d56",
          "green-dark": "#2a5d32",
        },
        alert: {
          red: "#dc2626",
          yellow: "#eab308",
          blue: "#3b82f6",
          orange: "#f97316",
        },
        status: {
          legal: "#22c55e",
          caution: "#eab308",
          illegal: "#dc2626",
          unknown: "#6b7280",
          review: "#f97316",
          pending: "#a855f7",
          reported: "#3b82f6",
          confirmed: "#0ea5e9",
          promulgated: "#14b8a6",
          effective: "#22c55e",
          recalled: "#ef4444",
        },
        tier: {
          1: "#10b981",
          2: "#06b6d4",
          3: "#8b5cf6",
          4: "#f59e0b",
          5: "#ef4444",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)",
        "card-hover":
          "0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)",
        glow: "0 0 15px rgba(58, 125, 68, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

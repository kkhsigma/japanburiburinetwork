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
        // --- Deep black base layers ---
        navy: {
          DEFAULT: "#030303",
          50: "#e8e8e8",
          100: "#c4c4c4",
          200: "#8e8e8e",
          300: "#5e5e5e",
          400: "#373737",
          500: "#1e1e1e",
          600: "#1a1a1a",
          700: "#111111",
          800: "#0a0a0a",
          900: "#030303",
          950: "#000000",
        },
        // --- Primary accent: muted teal ---
        accent: {
          DEFAULT: "#1a9a8a",
          50: "#e6f7f5",
          100: "#b3e8e2",
          200: "#80d9cf",
          300: "#4dcabc",
          400: "#26b8a8",
          500: "#1a9a8a",
          600: "#157d70",
          700: "#105f56",
          800: "#0b423c",
          900: "#062522",
        },
        // --- Signal accent: warm amber ---
        signal: {
          DEFAULT: "#d4a72d",
          50: "#fdf8e8",
          100: "#f9ecbe",
          200: "#f2d87a",
          300: "#e8c345",
          400: "#d4a72d",
          500: "#b8911f",
          600: "#9a7a1a",
          700: "#7c6215",
          800: "#5e4a10",
          900: "#3f310b",
        },
        // --- Critical: deep red ---
        critical: {
          DEFAULT: "#b91c1c",
          50: "#fde8e8",
          100: "#f8bfbf",
          200: "#f09595",
          300: "#e56c6c",
          400: "#d94343",
          500: "#b91c1c",
          600: "#991717",
          700: "#7a1212",
          800: "#5c0e0e",
          900: "#3d0909",
        },
        // --- Semantic: status colors ---
        status: {
          legal: "#22c55e",
          caution: "#eab308",
          illegal: "#dc2626",
          unknown: "#64748b",
          review: "#f97316",
          pending: "#a855f7",
          reported: "#3b82f6",
          confirmed: "#0ea5e9",
          promulgated: "#14b8a6",
          effective: "#22c55e",
          recalled: "#ef4444",
        },
        // --- Source tier colors ---
        tier: {
          1: "#10b981",
          2: "#06b6d4",
          3: "#8b5cf6",
          4: "#f59e0b",
          5: "#ef4444",
        },
        // --- Alert severity ---
        alert: {
          red: "#dc2626",
          yellow: "#eab308",
          blue: "#3b82f6",
          orange: "#f97316",
        },
        // --- Text hierarchy ---
        text: {
          primary: "#e2e2e2",
          secondary: "#949494",
          muted: "#646464",
          inverse: "#030303",
        },
        // --- Surface & border ---
        surface: {
          base: "#030303",
          raised: "#0a0a0a",
          elevated: "#111111",
          overlay: "#1a1a1a",
        },
        border: {
          DEFAULT: "#1e1e1e",
          subtle: "#151515",
          hover: "#2d2d2d",
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
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)",
        "card-hover":
          "0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)",
        elevated:
          "0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3)",
        overlay:
          "0 16px 48px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.4)",
        "inner-subtle": "inset 0 1px 2px rgba(0, 0, 0, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
        128: "32rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        "slide-in-right": "slideInRight 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
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

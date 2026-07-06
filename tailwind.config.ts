import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff9ed",
          100: "#fff1d2",
          200: "#ffe09c",
          300: "#ffca63",
          400: "#ffb236",
          500: "#f9950b",
          600: "#dd7106",
          700: "#b75309",
          800: "#943f10",
          900: "#793510"
        },
        slate: {
          950: "#1a1714"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        soft: "0 18px 50px -24px rgba(249, 149, 11, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;


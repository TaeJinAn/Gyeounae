import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./shared/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ice: {
          50: "#f7fbff",
          100: "#eef6ff",
          200: "#dbeeff",
          300: "#b9dcff",
          400: "#7cbcff",
          500: "#3a8cff",
          600: "#1f5fda",
          700: "#194db3",
          800: "#163f8f",
          900: "#12326f"
        },
        navy: {
          600: "#0c2d5e",
          700: "#0a244a",
          800: "#081c39"
        }
      }
    }
  },
  plugins: []
};

export default config;

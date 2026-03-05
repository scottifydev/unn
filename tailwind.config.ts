import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0a0a0a",
        chamber: "#141414",
        graphite: "#1e1e1e",
        slate: "#2a2a2a",
        seam: "#333333",
        ash: "#666666",
        stone: "#999999",
        pewter: "#b0b0b0",
        parchment: "#d4c5a9",
        paper: "#e8dcc8",
        garnet: {
          DEFAULT: "#8b1a1a",
          bright: "#a52a2a",
        },
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "serif"],
        crimson: ["var(--font-crimson)", "serif"],
        barlow: ["var(--font-barlow)", "sans-serif"],
      },
      fontSize: {
        "body": ["18.5px", { lineHeight: "1.78" }],
        "nav": ["11px", { letterSpacing: "0.14em" }],
        "tag": ["9.5px", { letterSpacing: "0.18em" }],
        "eyebrow": ["10px", { letterSpacing: "0.2em" }],
      },
    },
  },
  plugins: [],
};

export default config;

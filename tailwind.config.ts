import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        pixel: ["var(--font-pixel)", "ui-monospace", "monospace"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        neon: {
          cyan: "#22d3ee",
          gold: "#fbbf24",
        },
        tower: {
          void: "#05060f",
          steel: "#0b1020",
          panel: "#12182c",
        },
      },
      animation: {
        "neon-glow": "neon-glow 2.2s ease-in-out infinite",
        "pulse-fast": "pulse-fast 0.9s ease-in-out infinite",
        ticker: "ticker 28s linear infinite",
        marquee: "marquee 28s linear infinite",
        "float-up": "float-up 3.2s ease-in infinite",
        "tower-shift": "tower-shift 0.65s ease-out",
      },
      keyframes: {
        "neon-glow": {
          "0%, 100%": {
            filter: "brightness(1) saturate(1)",
            opacity: "0.85",
          },
          "50%": {
            filter: "brightness(1.35) saturate(1.4)",
            opacity: "1",
          },
        },
        "pulse-fast": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.96)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-33.333%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-33.333%)" },
        },
        "float-up": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0" },
          "15%": { opacity: "0.9" },
          "100%": { transform: "translateY(-120px) scale(0.4)", opacity: "0" },
        },
        "tower-shift": {
          "0%": { transform: "translateY(0)" },
          "35%": { transform: "translateY(6px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(34, 211, 238, 0.55)",
        "neon-gold": "0 0 20px rgba(251, 191, 36, 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;

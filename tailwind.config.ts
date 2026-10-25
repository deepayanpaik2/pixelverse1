import type { Config } from "tailwindcss";

/**
 * Midnight Gala — the Pixelverse palette.
 * A late-night ballroom: ink-violet surfaces, champagne gold as the one lead accent,
 * with orchid, sage and rose in supporting roles.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "420px",
      },
      colors: {
        arcade: {
          dark: "#0a0912",        // ink
          midnight: "#100e1c",    // deepest panel
          surface: "#17142a",     // raised surface
          surfaceHover: "#201b38",
          card: "rgba(23, 20, 42, 0.72)",
          border: "#2a2545",
          borderLight: "#3d3663",
          champagne: "#e9cb8b",   // lead accent
          champagneGlow: "rgba(233, 203, 139, 0.35)",
          orchid: "#b7a0f5",      // secondary accent
          orchidGlow: "rgba(183, 160, 245, 0.35)",
          sage: "#8fd9b6",        // success / free
          sageGlow: "rgba(143, 217, 182, 0.35)",
          rose: "#f28ba8",        // favourites / destructive
          roseGlow: "rgba(242, 139, 168, 0.35)",
          amber: "#f0b95c",       // ratings
        },
      },
      fontFamily: {
        sans: ["Figtree", "Noto Sans Devanagari", "Noto Sans Bengali", "system-ui", "sans-serif"],
        display: ["Fraunces", "Noto Serif Devanagari", "Noto Serif Bengali", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "champagne-glow": "0 0 22px -4px rgba(233, 203, 139, 0.45)",
        "orchid-glow": "0 0 22px -4px rgba(183, 160, 245, 0.45)",
        "sage-glow": "0 0 22px -4px rgba(143, 217, 182, 0.45)",
        "rose-glow": "0 0 22px -4px rgba(242, 139, 168, 0.45)",
        mosaic: "4px 4px 0px 0px rgba(233, 203, 139, 0.2)",
        "mosaic-solid": "3px 3px 0px 0px #e9cb8b",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        scanline: "scanline 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          "0%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

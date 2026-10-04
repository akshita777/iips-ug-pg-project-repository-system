import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1A2233",
        paper: "#FFFFFF",
        primary: "#2F7AC5",
        secondary: "#E8EEF9",
        accent: "#EFF6FF",
        success: "#DCFCE7",
        danger: "#FEE2E2",
        dangerInk: "#B91C1C",
        warn: "#FEF3C7",
        muted: "#F1F5F9",
        lilac: "#EEF2FF",
        navy: "#1E3A8A",
        saffron: "#FF9933",
      },
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        body: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["Space Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        brutal: "0 1px 3px rgba(26,34,51,0.12)",
        "brutal-sm": "0 1px 2px rgba(26,34,51,0.10)",
        "brutal-lg": "0 4px 12px rgba(26,34,51,0.14)",
        "brutal-none": "none",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};

export default config;

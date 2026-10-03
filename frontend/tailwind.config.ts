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
        ink: "#1C1B1A",
        paper: "#FFFEF9",
        primary: "#FFE99A",
        secondary: "#FFC7E3",
        accent: "#BEE6FF",
        success: "#BEF2C9",
        danger: "#FFC9C9",
        dangerInk: "#B42318",
        warn: "#FFD3AC",
        muted: "#F4EFE6",
        lilac: "#D8CCFF",
      },
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        body: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["Space Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        brutal: "4px 4px 0 #1C1B1A",
        "brutal-sm": "2px 2px 0 #1C1B1A",
        "brutal-lg": "8px 8px 0 #1C1B1A",
        "brutal-none": "0 0 0 #1C1B1A",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};

export default config;

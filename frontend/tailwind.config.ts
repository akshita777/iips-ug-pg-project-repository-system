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
        ink: "#000000",
        paper: "#FFFDF5",
        primary: "#FFDC58",
        secondary: "#FF90E8",
        accent: "#90E8FF",
        success: "#A6FA9B",
        danger: "#FF6B6B",
        warn: "#FF9D42",
        muted: "#F5F0E8",
      },
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        body: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brutal: "4px 4px 0 #000",
        "brutal-sm": "2px 2px 0 #000",
        "brutal-lg": "6px 6px 0 #000",
        "brutal-none": "0 0 0 #000",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};

export default config;

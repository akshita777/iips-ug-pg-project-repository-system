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
        navy: "#004b76",
        "navy-deep": "#00395a",
        blue: "#00629b",
        "blue-soft": "#e6f0f7",
        cyan: "#00b5e2",
        amber: "#b45309",
        "amber-text": "#92400e",
        cream: "#fffbeb",
        "cream-line": "#fde68a",
        paper: "#ffffff",
        band: "#f8fafc",
        line: "#e2e8f0",
        "line-strong": "#cbd5e1",
        ink: "#1e293b",
        "ink-2": "#475569",
        muted: "#526070",
        good: "#166534",
        "good-soft": "#dcfce7",
        warn: "#92400e",
        "warn-soft": "#fef3c7",
        bad: "#991b1b",
        "bad-soft": "#fee2e2",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        mono: ["Space Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(15 23 42 / 0.06), 0 1px 3px rgb(15 23 42 / 0.08)",
        nav: "0 1px 3px rgb(0 0 0 / 0.15)",
        menu: "0 6px 12px rgb(0 0 0 / 0.15)",
      },
      borderRadius: {
        card: "6px",
        ctl: "4px",
      },
      maxWidth: {
        wrap: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;

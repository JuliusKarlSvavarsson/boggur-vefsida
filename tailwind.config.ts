import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          light: "#6366F1",
          dark: "#312E81",
        },
        secondary: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#047857",
        },
        danger: "#EF4444",
        accent: "#F97316",
        muted: "#6B7280",
        bg: "#F3F4F6",
        surface: "#FFFFFF",
      },
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

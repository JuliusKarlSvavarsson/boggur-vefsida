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
          DEFAULT: "#1D4ED8",
          light: "#60A5FA",
          dark: "#1E3A8A",
        },
        accent: "#F97316",
        muted: "#64748B",
        bg: "#0F172A",
      },
    },
  },
  plugins: [],
};

export default config;

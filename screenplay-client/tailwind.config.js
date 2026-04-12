/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0a0a0a",
        "bg-surface": "#111111",
        "bg-card": "#1a1a1a",
        accent: "#e11d48",
        "accent-hover": "#be123c",
        "accent-light": "#fb7185",
        "text-secondary": "#a3a3a3",
        "text-tertiary": "#737373",
        "text-faint": "#404040",
      },
      boxShadow: {
        nav: "0 1px 0 rgba(255,255,255,0.05),0 8px 32px rgba(0,0,0,0.6)",
        card: "0 4px 24px rgba(0,0,0,0.5)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.7)",
        glow: "0 0 28px rgba(225,29,72,0.18)",
        "glow-lg": "0 0 48px rgba(225,29,72,0.26)",
        input: "0 0 0 3px rgba(225,29,72,0.14)",
      },
    },
  },
  plugins: [],
};

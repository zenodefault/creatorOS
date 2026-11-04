/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#4461ee",
        "secondary": "#f72585",
        "background-light": "#f6f6f8",
        "background-dark": "#101322",
        "surface": {
          "light": "#ffffff",
          "dark": "#151828",
          "glass": "rgba(255, 255, 255, 0.06)",
        },
        "surface-glass-hover": "rgba(255, 255, 255, 0.04)",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
      boxShadow: {
        soft: "0 2px 4px rgba(15, 23, 42, 0.04), 0 12px 32px -16px rgba(15, 23, 42, 0.18)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
}

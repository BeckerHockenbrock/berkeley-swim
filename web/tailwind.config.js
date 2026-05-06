/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,jsx}", "./public/**/*.json"],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        foreground: "#0F172A",
        muted: "#64748B",
        pool: "#0EA5E9",
        open: "#10B981",
        closed: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
};

module.exports = config;

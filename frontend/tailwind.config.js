/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // bleu
          light: "#3b82f6",
          dark: "#1e40af",
        },
        secondary: {
          DEFAULT: "#7c3aed", // violet
          light: "#a78bfa",
          dark: "#5b21b6",
        },
        success: {
          DEFAULT: "#16a34a", // vert
          light: "#22c55e",
          dark: "#166534",
        },
        danger: {
          DEFAULT: "#dc2626", // rouge
          light: "#ef4444",
          dark: "#991b1b",
        },
        warning: {
          DEFAULT: "#f59e0b", // orange
          light: "#fbbf24",
          dark: "#b45309",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0,0,0,0.08)",
        card: "0 8px 20px rgba(0,0,0,0.06)",
        "card-hover": "0 12px 24px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseScale: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-out",
        pulseScale: "pulseScale 2s infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
}

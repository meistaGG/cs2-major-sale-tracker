import defaultTheme from "tailwindcss/defaultTheme";

/**
 * Mirrors csmf-case-tracking/web/tailwind.config.js so the two sites share one
 * look: soft shadow, 1rem 2xl radius, and the same type scale (every named
 * step shifted one place up Tailwind's default).
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
      },
      borderRadius: { "2xl": "1rem" },
      boxShadow: { soft: "0 8px 24px rgba(0,0,0,0.08)" },
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.25rem" }],
        sm: ["1rem", { lineHeight: "1.5rem" }],
        base: ["1.125rem", { lineHeight: "1.75rem" }],
        lg: ["1.25rem", { lineHeight: "1.75rem" }],
        xl: ["1.5rem", { lineHeight: "2rem" }],
        "2xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "4xl": ["3rem", { lineHeight: "1" }],
        "5xl": ["3.75rem", { lineHeight: "1" }],
        "6xl": ["4.5rem", { lineHeight: "1" }],
      },
    },
  },
  plugins: [],
};

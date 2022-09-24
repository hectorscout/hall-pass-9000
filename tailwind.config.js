/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        warning: "rgb(202 138 4 / 1)",
        critical: "rgb(220 38 38 / 1)",
      },
    },
  },
  plugins: [],
};

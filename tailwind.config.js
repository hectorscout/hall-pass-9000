/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        warning: "rgb(202 138 4 / 1)",
        critical: "rgb(220 38 38 / 1)",
      },
      keyframes: {
        "dvd-x": { from: { left: 0 }, to: { left: "calc(100% - 145px)" } },
        "dvd-y": { from: { top: 0 }, to: { top: "calc(100% - 145px)" } },
      },
      animation: {
        "dvd-ease":
          "dvd-y 13.1s ease-in-out infinite alternate, dvd-x 10s ease-in-out infinite alternate, spin 12s linear infinite",
        "dvd-linear":
          "dvd-y 13.1s linear infinite alternate, dvd-x 10s linear infinite alternate, spin 12s linear infinite",
      },
    },
  },
  plugins: [],
};

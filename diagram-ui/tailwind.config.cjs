/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ← IMPORTANT (not 'media')
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};

// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",           // Scan the main HTML file
    "./src/**/*.{js,jsx}",    // Scan all JS and JSX files in src folder
  ],
  theme: {
    extend: {
      // You can add custom colors, fonts, or spacing here if needed
      // For now, we use the default Tailwind theme
    },
  },
  plugins: [],
}
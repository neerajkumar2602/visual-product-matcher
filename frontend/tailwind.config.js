/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      // Mobile-first breakpoints (Tailwind defaults)
      screens: {
        'sm': '640px',   // Tablet
        'md': '768px',   // Tablet landscape
        'lg': '1024px',  // Desktop
        'xl': '1280px',  // Large desktop
        '2xl': '1536px', // Extra large desktop
      },
    },
  },
  plugins: [],
}

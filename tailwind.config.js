/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"], // Vérifiez que ces chemins sont corrects
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6", // Bleu principal
      },
    },
  },
  plugins: [],
};

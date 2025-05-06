// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Make sure your source paths are correct
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwind-scrollbar-hide")], // ✅ Add this line
};

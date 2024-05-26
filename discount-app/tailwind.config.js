/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");
export default {
  content: [
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./app/**/**/*.{jsx, js}",
  ],
  theme: {
    extend: {
      margin: {
        "100px": "100px",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};

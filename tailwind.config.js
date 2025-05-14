/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        warning: '#FFA500',  // Orange color for warning noise levels
        danger: '#FF0000',   // Red color for dangerous noise levels
      },
    },
  },
  plugins: [],
} 
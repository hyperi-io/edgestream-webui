/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8cad2c',
        secondary: '#2a2f3a',
        bluegray: '#959db0',
      },
      ringColor: '#8cad2c',
    },
  },
  corePlugins: {
    preflight: false,
  },
};

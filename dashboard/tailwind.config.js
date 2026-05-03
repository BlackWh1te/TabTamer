/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#16171d',
          raised: '#1f2028',
          hover: '#2a2b36',
        },
        brand: {
          DEFAULT: '#c084fc',
          dim: 'rgba(192, 132, 252, 0.15)',
        },
      },
    },
  },
  plugins: [],
}


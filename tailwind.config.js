/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f0ff',
          100: '#ede5ff',
          200: '#dcceff',
          300: '#c4a8ff',
          400: '#a875ff',
          500: '#8b3dff',
          600: '#7c1fff',
          700: '#6b0ff5',
          800: '#5a0dd4',
          900: '#4a0eae',
        },
        mystic: {
          50: '#fef9f0',
          100: '#fdf0d5',
          200: '#fbe0a8',
          300: '#f8c971',
          400: '#f5a833',
          500: '#f28e0a',
          600: '#e37207',
          700: '#bc530a',
          800: '#96410f',
          900: '#7a3710',
        },
        dark: {
          800: '#1a1a2e',
          900: '#0f0f1a',
        }
      },
      fontFamily: {
        mystical: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 61, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 61, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
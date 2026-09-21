/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
    "./resources/**/*.ts",
    "./resources/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#1d4ed8',
            600: '#1e40af', // Medikasa Primary Blue
            700: '#1e3a8a',
            800: '#172554',
            900: '#0f172a',
          },
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a', // Medikasa Accent Green
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
        },
        sidebar: {
          bg: '#1e1e2d',
          hover: '#1b1b28',
          active: '#27273a',
          text: '#9899ac',
          textActive: '#ffffff',
          border: '#2d2d3f'
        },
        surface: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          border: '#e4e6ef',
          card: '#ffffff'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

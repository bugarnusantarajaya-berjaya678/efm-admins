/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E1C43',
          2: '#2D2B5A',
        },
        accent: {
          DEFAULT: '#E05945',
          hover: '#C94A38',
        },
        'bg-page': '#F5F5F7',
        'bg-surface': '#FFFFFF',
        border: '#E2E6EA',
        'text-primary': '#1E1C43',
        'text-muted': '#6C757D',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

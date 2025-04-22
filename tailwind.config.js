/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif']
      },
      colors: {
        background: '#F8FAFC',
        primary: {
          DEFAULT: '#2F80ED',
          50: '#EBF3FE',
          100: '#D7E8FD',
          200: '#B0D1FB',
          300: '#88BAF9',
          400: '#61A3F7',
          500: '#2F80ED',
          600: '#1366D1',
          700: '#0E4C9E',
          800: '#09326B',
          900: '#041838'
        },
        secondary: {
          DEFAULT: '#F2F4F7',
          50: '#FFFFFF',
          100: '#FAFBFC',
          200: '#F2F4F7',
          300: '#E4E7EC',
          400: '#D0D5DD',
          500: '#98A2B3',
          600: '#667085',
          700: '#475467',
          800: '#2D3748',
          900: '#1A2231'
        },
        accent: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B'
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      }
    }
  },
  plugins: [
    require('tailwindcss-animate')
  ]
}
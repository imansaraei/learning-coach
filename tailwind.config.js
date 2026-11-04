/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        garamond: ['EB Garamond', 'Georgia', 'serif'],
        serif: ['EB Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },
      colors: {
        primary: {
          DEFAULT: '#F2CA50',
          container: '#D4AF37',
          fixed: '#FFE088',
          dim: '#E9C349',
          dark: '#554300',
        },
        'on-primary': '#3C2F00',
        'on-primary-container': '#554300',
        surface: {
          dim: '#111317',
          DEFAULT: '#111317',
          bright: '#37393D',
          'container-lowest': '#0C0E11',
          'container-low': '#1A1C1F',
          container: '#1E2023',
          'container-high': '#282A2D',
          'container-highest': '#333538',
        },
        'on-surface': '#E2E2E6',
        'on-surface-variant': '#D0C5AF',
        outline: {
          DEFAULT: '#99907C',
          variant: '#4D4635',
        },
        secondary: {
          DEFAULT: '#DEC1B1',
          container: '#574236',
          fixed: '#FBDCCC',
          dim: '#DEC1B1',
        },
        tertiary: {
          DEFAULT: '#B7D1F2',
          container: '#9CB5D6',
          fixed: '#D1E4FF',
        },
        wood: {
          dark: '#110905',
          shelf: '#211209',
          mid: '#382012',
          bevel: '#85502C',
          bracket: '#826932',
          brass: '#BBA15A',
        },
        vellum: {
          DEFAULT: '#F8F3E6',
          shadow: '#ECE3CF',
          ink: '#1C2430',
          'wet-ink': '#364F6B',
        }
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(242, 202, 80, 0.35)',
        'candle-halo': '0 0 28px rgba(212, 175, 55, 0.25)',
        'shelf-recess': 'inset 0 12px 24px rgba(0, 0, 0, 0.85)',
        'shelf-plank': '0 12px 24px rgba(0, 0, 0, 0.85)',
        'spine-depth': '-6px 14px 20px rgba(0, 0, 0, 0.75)',
        'tome-drawn': '-8px 18px 25px rgba(0, 0, 0, 0.85), 0 0 18px rgba(242, 202, 80, 0.35)',
        'parchment-spread': '0 12px 36px rgba(0, 0, 0, 0.65), inset 0 0 24px rgba(42, 26, 16, 0.15)',
      }
    },
  },
  plugins: [],
}

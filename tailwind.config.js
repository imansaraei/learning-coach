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
        heading: ['Space Grotesk', 'Vazirmatn', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      borderRadius: {
        'sm': '2px',
        DEFAULT: '4px',
        'md': '4px',
        'lg': '6px',
        'xl': '8px',
        'full': '9999px',
      },
      colors: {
        canvas: '#0B0E14',
        surface: {
          dim: '#07090D',
          DEFAULT: '#12161F',
          container: '#12161F',
          low: '#0E121A',
          high: '#1A202C',
          highest: '#232B3B',
        },
        border: {
          subtle: '#181E29',
          DEFAULT: '#232B3B',
          bright: '#384357',
          neon: '#00F5D4',
        },
        petronas: {
          primary: '#00A19B',
          secondary: '#00F5D4',
          tertiary: '#05D5AA',
          dim: '#004A47',
          dark: '#002B29',
        },
        silver: {
          platinum: '#E2E8F0',
          aero: '#94A3B8',
          graphite: '#64748B',
          dark: '#334155',
        }
      },
      boxShadow: {
        'telemetry-glow': '0 0 16px rgba(0, 245, 212, 0.25), inset 0 0 8px rgba(0, 245, 212, 0.08)',
        'telemetry-hover': '0 0 20px rgba(0, 161, 155, 0.35)',
        'petronas-btn': '0 0 14px rgba(0, 245, 212, 0.35)',
        'modal-elevation': '0 24px 48px -12px rgba(0, 0, 0, 0.85), 0 0 24px 0 rgba(0, 161, 155, 0.15)',
      }
    },
  },
  plugins: [],
}

import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#ffffff',
        primary: {
          DEFAULT: '#7B2CBF',
          foreground: '#ffffff',
        },
        muted: '#0f0f12',
        card: '#0b0b0d',
      },
      boxShadow: {
        glow: '0 0 30px rgba(123,44,191,0.35)'
      }
    },
  },
  plugins: [],
}
export default config



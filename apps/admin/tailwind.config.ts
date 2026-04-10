import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        amber: { DEFAULT: '#E8832A' },
        teal: { DEFAULT: '#1A6B7A' },
        cream: { DEFAULT: '#F7F0E3' },
      },
    },
  },
  plugins: [],
}

export default config

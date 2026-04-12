import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        amber:   '#E8832A',
        teal:    '#1A6B7A',
        cream:   '#F7F0E3',
        dark:    '#1A1A2E',
        taste:   '#B85C1A',
        wild:    '#2D6E4E',
        move:    '#1A5F8A',
        roots:   '#614A9E',
        restore: '#5E8C6E',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans:  ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

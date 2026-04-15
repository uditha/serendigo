import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        amber:   '#1d7dc8',
        teal:    '#1A6B7A',
        cream:   '#F7F0E3',
        dark:    '#1A1A2E',
        taste:   '#B85C1A',
        wild:    '#2D6E4E',
        move:    '#1A5F8A',
        roots:   '#614A9E',
        restore: '#5E8C6E',
        /* Semantic tokens — values mirror CSS variables in globals.css */
        sg: {
          primary: 'var(--sg-primary)',
          secondary: 'var(--sg-secondary)',
          cream: 'var(--sg-cream)',
          'cream-bright': 'var(--sg-cream-bright)',
          ink: 'var(--sg-ink)',
          muted: 'var(--sg-muted)',
          base: 'var(--sg-bg-base)',
          elevated: 'var(--sg-bg-elevated)',
          section: 'var(--sg-bg-section)',
          rich: 'var(--sg-bg-rich)',
          deep: 'var(--sg-bg-deep)',
          partner: 'var(--sg-bg-partner)',
          footer: 'var(--sg-bg-footer)',
          border: 'var(--sg-border-subtle)',
          'border-strong': 'var(--sg-border-strong)',
          nav: 'var(--sg-nav-glass)',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'DM Serif Display', 'serif'],
        sans: ['var(--font-sans)', 'Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'sg-card': 'var(--sg-shadow-card)',
        'sg-glow-amber': '0 0 40px rgba(29, 125, 200, 0.14)',
      },
    },
  },
  plugins: [],
}
export default config

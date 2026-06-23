/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/Home.tsx',
    './src/components/landing/**/*.{ts,tsx}',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: 'var(--color-brand)',
        'brand-hover': 'var(--color-brand-hover)',
        'brand-dark': 'var(--color-brand-dark)',
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        overlay: 'var(--color-overlay)',
        elevated: 'var(--color-elevated)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
      },
      fontFamily: {
        heading: ['DM Serif Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

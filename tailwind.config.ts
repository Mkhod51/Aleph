import type { Config } from 'tailwindcss';

/**
 * Design tokens map to CSS variables defined in src/styles/tokens.css so themes
 * (dark default / light / system) swap by re-binding the variables, per doc 07 §2.
 * Colors are referenced as `var(--token)`; opacity modifiers are intentionally
 * unused on token colors (state colors are used at full strength).
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-dim': 'var(--text-dim)',
        accent: 'var(--accent)',
        good: 'var(--good)',
        'good-bg': 'var(--good-bg)',
        bad: 'var(--bad)',
        'bad-bg': 'var(--bad-bg)',
        'band-1': 'var(--band-1)',
        'band-2': 'var(--band-2)',
        'band-3': 'var(--band-3)',
        'band-4': 'var(--band-4)',
        'band-5': 'var(--band-5)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        // doc 07 §2 type scale
        question: ['clamp(3rem, 9vw, 6rem)', { lineHeight: '1' }],
        hero: ['4rem', { lineHeight: '1' }],
      },
      borderRadius: {
        card: '8px',
        btn: '6px',
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
};

export default config;

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
      // Motion tokens (ui-review 02). Durations/easing map to the CSS vars in
      // tokens.css so there is one source of truth; reduced-motion collapses them
      // globally in index.css. Classes read `duration-fast`, `ease-out-t`, etc.
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        moment: 'var(--dur-moment)',
      },
      transitionTimingFunction: {
        'out-t': 'var(--ease-out)',
      },
      // Keyframes for the spec'd meaningful moments (M3–M6). M1 is a JS rAF
      // count-up and M2/M7 are plain transitions, so they need no keyframe here.
      keyframes: {
        'fade-rise': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pb-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        'count-tick': {
          from: { opacity: '0', transform: 'scale(1.12)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'overlay-in': {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        reveal: 'fade-rise var(--dur-base) var(--ease-out) 100ms both', // M3 body reveal
        'pb-pulse': 'pb-pulse 200ms var(--ease-out)', // M4 PB emphasis (one 200 ms pulse)
        tick: 'count-tick var(--dur-base) var(--ease-out)', // M5 countdown tick
        'overlay-in': 'overlay-in var(--dur-fast) var(--ease-out)', // M6 overlay open
      },
    },
  },
  plugins: [],
};

export default config;

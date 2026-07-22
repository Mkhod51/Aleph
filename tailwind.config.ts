import type { Config } from 'tailwindcss';

/**
 * Design tokens map to CSS variables defined in src/styles/tokens.css so themes
 * (dark default / light / system) swap by re-binding the variables, per doc 07 §2
 * and ui-redesign/01. Colors are referenced as `var(--token)`; opacity modifiers
 * are intentionally unused on token colors (state colors are used at full strength).
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        border: 'var(--border)',
        'border-2': 'var(--border-2)',
        text: 'var(--text)',
        'text-dim': 'var(--text-dim)',
        'text-faint': 'var(--text-faint)',
        accent: 'var(--accent)',
        'accent-hi': 'var(--accent-hi)',
        'accent-dim': 'var(--accent-dim)',
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
        // doc 07 §2 type scale; hero score widened per ui-redesign/01 §4.
        question: ['clamp(3rem, 9vw, 6rem)', { lineHeight: '1' }],
        hero: ['clamp(3.25rem, 7vw, 5rem)', { lineHeight: '1' }],
      },
      borderRadius: {
        // Cards bumped 8→10 for a softer, more modern read (ui-redesign/01 §2);
        // buttons stay 6px.
        card: '10px',
        btn: '6px',
      },
      maxWidth: {
        content: '72rem',
      },
      // Motion tokens (ui-review 02, ui-redesign/01 §5). Durations/easing map to
      // the CSS vars in tokens.css so there is one source of truth; reduced-motion
      // collapses them globally in index.css. Classes read `duration-fast`,
      // `ease-out-t`, `ease-spring-t`, etc.
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
        moment: 'var(--dur-moment)',
      },
      transitionTimingFunction: {
        'out-t': 'var(--ease-out)',
        'spring-t': 'var(--ease-spring)',
        'in-out-t': 'var(--ease-in-out)',
      },
      // Keyframes for the spec'd meaningful moments (M3–M6 + the redesign's
      // one-shot chip/check pop). M1 is a JS rAF count-up and M2/M7 are plain
      // transitions, so they need no keyframe here.
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
        // One-shot spring pop for chips/checks appearing as feedback (R4/S1).
        pop: {
          from: { opacity: '0', transform: 'scale(0.85)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        // One-shot flare on the flame/bolt when streak/due increases (ui-cleanup §3.2).
        flare: {
          '0%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        reveal: 'fade-rise var(--dur-base) var(--ease-spring) 100ms both', // M3 body reveal (springy, ui-cleanup §3.3)
        'pb-pulse': 'pb-pulse 200ms var(--ease-spring)', // M4 PB emphasis (one spring pulse)
        tick: 'count-tick var(--dur-base) var(--ease-spring)', // M5/C1 countdown tick
        'overlay-in': 'overlay-in var(--dur-fast) var(--ease-out)', // M6/O1 overlay open
        pop: 'pop 200ms var(--ease-spring) both', // one-shot chip/check pop
        flare: 'flare 220ms var(--ease-spring)', // one-shot flame/bolt flare on increase
      },
    },
  },
  plugins: [],
};

export default config;

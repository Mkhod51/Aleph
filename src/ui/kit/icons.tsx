import { useEffect, useRef, useState, type ReactNode, type SVGProps } from 'react';

/**
 * The in-house icon set (ui-cleanup §1). Hand-rolled inline SVG, no icon library
 * and no runtime dependency. Each mark:
 *   - inherits `currentColor`, so callers tint via `text-*` (good/bad/accent);
 *   - sizes to 1em (≈14px in body copy, scales up beside larger numerals) and
 *     sits on the text baseline (`align-[-0.125em]`);
 *   - is decorative by default (`aria-hidden`) — where a mark carries meaning the
 *     caller keeps an aria-label on the wrapping element (e.g. ✓/✗ = correct/wrong).
 *
 * FlameIcon/BoltIcon accept an optional numeric `value`: when it INCREASES after
 * mount they play one spring "flare" (never on hydration, never on decrease,
 * never looping — see useIncreaseFlare). Reduced-motion collapses it to instant
 * via the global override in index.css.
 */
type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, className = '', ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      aria-hidden
      focusable={false}
      className={['inline-block shrink-0 align-[-0.125em]', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </svg>
  );
}

/** A slim right-pointing triangle; corners softened by a hairline round join. */
export function PlayIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M5 3.4 12.4 8 5 12.6Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

/** A checkmark, stroked. Tint with `text-good`; label the wrapper "correct". */
export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M3.4 8.4 6.4 11.4 12.6 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

/** An X, stroked. Tint with `text-bad`; label the wrapper "wrong". */
export function CrossIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M4.2 4.2 11.8 11.8M11.8 4.2 4.2 11.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

/**
 * Fire one `animate-flare` when `value` increases after mount. A short settle
 * window swallows the initial async 0→N data load (IndexedDB reads resolve well
 * within it) so the flare only ever marks a genuine gain, and `onAnimationEnd`
 * clears the class so the next increase can re-trigger it — never a loop.
 */
function useIncreaseFlare(value: number | undefined) {
  const prev = useRef(value);
  const settled = useRef(false);
  const [flare, setFlare] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      settled.current = true;
    }, 250);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (
      settled.current &&
      value !== undefined &&
      prev.current !== undefined &&
      value > prev.current
    ) {
      setFlare(true);
    }
    prev.current = value;
  }, [value]);

  return {
    className: flare ? 'origin-center animate-flare' : 'origin-center',
    onAnimationEnd: () => setFlare(false),
  };
}

/** Streak mark. Tint with `text-accent`; pass `value` to flare on a new gain. */
export function FlameIcon({ value, className = '', ...props }: IconProps & { value?: number }) {
  const flare = useIncreaseFlare(value);
  return (
    <IconBase
      className={[flare.className, className].filter(Boolean).join(' ')}
      onAnimationEnd={flare.onAnimationEnd}
      {...props}
    >
      <path
        d="M8 1.6c2.1 2.6 3.4 4.2 3.4 6.6a3.4 3.4 0 1 1-6.8 0c0-1.2.5-2.2 1.4-3 0 1 .5 1.7 1.2 2C6.7 5.6 7.1 3.7 8 1.6Z"
        fill="currentColor"
      />
    </IconBase>
  );
}

/** Due-count mark. Tint with `text-accent`; pass `value` to flare on a new gain. */
export function BoltIcon({ value, className = '', ...props }: IconProps & { value?: number }) {
  const flare = useIncreaseFlare(value);
  return (
    <IconBase
      className={[flare.className, className].filter(Boolean).join(' ')}
      onAnimationEnd={flare.onAnimationEnd}
      {...props}
    >
      <path d="M9.3 1.5 4 8.9H7.1L6.2 14.5 12 7.1H8.6Z" fill="currentColor" />
    </IconBase>
  );
}

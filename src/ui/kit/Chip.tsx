import type { ReactNode } from 'react';

/**
 * Chip — the one pill for tags / deltas / status / band labels (ui-redesign/02 §B).
 * tone drives color (color = state); `glow` adds the amber PB emphasis; `pop`
 * plays a one-shot spring pop for chips that mount as feedback (e.g. a new
 * delta). Static otherwise.
 */
export type ChipTone = 'neutral' | 'accent' | 'good' | 'bad' | 'band';

const TONE: Record<ChipTone, string> = {
  neutral: 'border-border bg-surface-2 text-text-dim',
  accent: 'border-border-2 bg-surface-2 text-accent',
  good: 'border-transparent bg-good-bg text-good',
  bad: 'border-transparent bg-bad-bg text-bad',
  band: 'border-border bg-surface-2 text-text-dim',
};

const SIZE = {
  sm: 'px-2 py-0.5 text-[0.6875rem]',
  md: 'px-2.5 py-1 text-xs',
} as const;

export function Chip({
  tone = 'neutral',
  size = 'sm',
  glow = false,
  pop = false,
  className = '',
  children,
}: {
  tone?: ChipTone;
  size?: keyof typeof SIZE;
  glow?: boolean;
  pop?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border font-medium leading-none',
        SIZE[size],
        TONE[tone],
        pop && 'animate-pop',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        glow
          ? { boxShadow: '0 0 0 1px var(--accent-glow), 0 0 10px var(--accent-glow)' }
          : undefined
      }
    >
      {children}
    </span>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * The single button primitive (ui-review 03 §C1). One component replaces the ~45
 * ad-hoc `rounded-btn px-…` combos so every button shares padding, timing,
 * hover/press and disabled behaviour. Renders a real <button> — accessible name
 * and role are unchanged, so role+name queries (e2e) keep working.
 *
 * Layout-only overrides (w-full, self-start, one-off padding) go through
 * `className`; visual style comes from variant/size only.
 */
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-accent text-bg font-medium hover:brightness-110 active:scale-[0.98]',
  secondary: 'border border-border text-text-dim hover:border-accent hover:text-text',
  danger: 'border border-bad text-text hover:bg-bad-bg',
  ghost: 'text-text-dim hover:text-text',
};

const SIZE: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2',
  lg: 'px-6 py-3 text-lg',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Mono + semibold label — the start-action style. */
  mono?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  mono = false,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'rounded-btn transition-[color,background-color,border-color,transform,filter] duration-fast ease-out-t',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT[variant],
        SIZE[size],
        mono && 'font-mono font-semibold',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}

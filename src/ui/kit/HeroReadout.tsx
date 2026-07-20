import type { ReactNode } from 'react';

/**
 * HeroReadout — the signature "instrument readout" number treatment
 * (ui-redesign/02 §B). A big JetBrains-Mono tabular figure (-0.02em), optional
 * thin top+bottom hairline rule, optional label/unit slots, optional amber
 * `emphasis` (PB / net). Used on the Results hero and the daily-done state.
 * NOT used live during play (play-screen sanctity).
 */
export function HeroReadout({
  value,
  label,
  sub,
  unit,
  emphasis = false,
  size = 'lg',
  rule = true,
  align = 'center',
  className = '',
}: {
  value: ReactNode;
  label?: ReactNode;
  sub?: ReactNode;
  unit?: ReactNode;
  emphasis?: boolean;
  size?: 'md' | 'lg';
  rule?: boolean;
  align?: 'center' | 'left';
  className?: string;
}) {
  const alignCls = align === 'left' ? 'items-start text-left' : 'items-center text-center';
  return (
    <div className={['flex flex-col gap-2', alignCls, className].join(' ')}>
      {label && (
        <div className="text-[0.8125rem] font-medium uppercase tracking-[0.06em] text-text-faint">
          {label}
        </div>
      )}
      <div className={rule ? 'border-y border-border py-2' : undefined}>
        <span
          className={[
            'readout font-semibold leading-none',
            size === 'lg' ? 'text-hero' : 'text-5xl',
            emphasis ? 'text-accent' : 'text-text',
          ].join(' ')}
        >
          {value}
        </span>
        {unit && (
          <span className="readout ml-2 align-baseline text-xl text-text-dim">
            {unit}
          </span>
        )}
      </div>
      {sub && <div className="text-sm text-text-dim">{sub}</div>}
    </div>
  );
}

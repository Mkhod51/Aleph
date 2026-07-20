import type { ReactNode } from 'react';
import { Chip } from './Chip';

/**
 * StatTile — the one "number + label" unit (ui-redesign/02 §B). Replaces the
 * scattered vitals / headline / skill number displays; a grid of these is the
 * results vitals row and the dashboard headline strip. `delta` (a signed number)
 * renders an auto-colored ↑/↓ Chip. Numbers use the mono `.readout` by default.
 */
export function StatTile({
  label,
  value,
  delta,
  sub,
  mono = true,
  align = 'left',
  className = '',
}: {
  label: ReactNode;
  value: ReactNode;
  delta?: number;
  sub?: ReactNode;
  mono?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}) {
  const alignCls =
    align === 'center'
      ? 'items-center text-center'
      : align === 'right'
        ? 'items-end text-right'
        : 'items-start text-left';
  return (
    <div className={['flex flex-col gap-1', alignCls, className].join(' ')}>
      <div className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-text-faint">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={[
            mono ? 'readout' : '',
            'text-2xl font-semibold text-text',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {value}
        </span>
        {delta != null && <DeltaChip delta={delta} />}
      </div>
      {sub && <div className="text-xs text-text-dim">{sub}</div>}
    </div>
  );
}

/** A signed delta pill: positive → good ↑, negative → bad ↓, zero → neutral. */
function DeltaChip({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <Chip tone="neutral" size="sm">
        ±0
      </Chip>
    );
  }
  const up = delta > 0;
  return (
    <Chip tone={up ? 'good' : 'bad'} size="sm">
      {up ? '↑' : '↓'} {up ? '+' : '−'}
      {Math.abs(delta)}
    </Chip>
  );
}

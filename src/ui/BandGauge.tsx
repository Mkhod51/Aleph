import { useEffect, useState } from 'react';
import type { Band } from '@/content/bands';

/**
 * A horizontal band gauge (doc 07 results/sim lobby, upgraded per ui-redesign/02
 * §A + motion G1). Segments are proportional to each band's range; an optional
 * marker is a thin amber needle with a soft glow that fills in on mount over
 * --dur-slow. Bands are labeled elsewhere as "community-reported".
 */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function BandGauge({
  bands,
  max,
  value,
}: {
  bands: Band[];
  max: number;
  value?: number | null;
}) {
  const segments = bands.map((b, i) => {
    const start = b.min;
    const end = i + 1 < bands.length ? (bands[i + 1] as Band).min : max;
    return { ...b, start, end, width: ((end - start) / max) * 100 };
  });
  const markerPct =
    value != null ? Math.max(0, Math.min(100, (value / max) * 100)) : null;

  // Mount fill (G1): the needle slides from 0 → value over --dur-slow.
  // Reduced-motion starts filled (static final state, no transition).
  const [filled, setFilled] = useState(prefersReducedMotion);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div>
      <div className="relative">
        <div className="flex h-3 w-full overflow-hidden rounded-full border border-border">
          {segments.map((s) => (
            <div
              key={s.label}
              style={{
                width: `${s.width}%`,
                backgroundColor: s.color,
                opacity: 0.55,
              }}
            />
          ))}
        </div>
        {markerPct != null && (
          <div
            className="pointer-events-none absolute top-1/2 h-[calc(100%+8px)] w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent transition-[left] duration-slow ease-out-t"
            style={{
              left: `${filled ? markerPct : 0}%`,
              boxShadow: '0 0 6px 1px var(--accent-glow)',
            }}
            aria-hidden
          />
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.6875rem] text-text-dim">
        {segments.map((s) => (
          <span key={s.label}>
            <span
              className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
              style={{ backgroundColor: s.color }}
            />
            {s.label} ({s.start}
            {s.end < max ? `–${s.end - 1}` : '+'})
          </span>
        ))}
      </div>
    </div>
  );
}

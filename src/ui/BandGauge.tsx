import type { Band } from '@/content/bands';

/**
 * A horizontal band gauge (doc 07 results/sim lobby). Segments are proportional
 * to each band's range; an optional marker shows where a net score falls. Bands
 * are labeled elsewhere as "community-reported".
 */
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

  return (
    <div>
      <div className="relative flex h-3 w-full overflow-hidden rounded-full">
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ width: `${s.width}%`, backgroundColor: s.color, opacity: 0.5 }}
          />
        ))}
        {markerPct != null && (
          <div
            className="absolute top-[-2px] h-[calc(100%+4px)] w-0.5 bg-text"
            style={{ left: `${markerPct}%` }}
            aria-hidden
          />
        )}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.6875rem] text-text-dim">
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

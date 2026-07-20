import { isWeakFact } from '@/engine';
import { formatLatency } from '@/lib/format';
import type { FactStat } from '@/store/types';

const LO = 2;
const HI = 20;
const RANGE = Array.from({ length: HI - LO + 1 }, (_, i) => i + LO);

function keyFor(a: number, b: number): string {
  return `mul:${Math.min(a, b)}×${Math.max(a, b)}`;
}

/** Discrete heat bucket (0 fast → 4 slow) from a normalized latency. */
function heatColor(norm: number): string {
  const bucket = Math.min(4, Math.max(0, Math.floor(norm * 5)));
  return `var(--heat-${bucket})`;
}

/**
 * Times-table heatmap (doc 05 §4 card 4). Cells colored by median latency, weak
 * facts outlined, cells with < 3 attempts left blank. Click → a fact drill (stub
 * route until M4). Colorblind-safe sequential-lightness ramp (doc 07 §7).
 */
export function Heatmap({
  facts,
  referenceMedianMs,
  onCellClick,
}: {
  facts: FactStat[];
  referenceMedianMs: number;
  onCellClick: (factKey: string) => void;
}) {
  const byKey = new Map(facts.map((f) => [f.factKey, f]));
  const medians = facts.filter((f) => f.attempts >= 3).map((f) => f.medianLatencyMs);
  const min = medians.length ? Math.min(...medians) : 0;
  const max = medians.length ? Math.max(...medians) : 1;
  const span = max - min || 1;

  return (
    <div>
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-0.5"
          style={{ gridTemplateColumns: `1.5rem repeat(${RANGE.length}, 1.25rem)` }}
        >
          <div />
          {RANGE.map((c) => (
            <div key={`h${c}`} className="text-center text-[0.5rem] text-text-dim">
              {c}
            </div>
          ))}
          {RANGE.map((r) => (
            <FragmentRow
              key={`r${r}`}
              r={r}
              byKey={byKey}
              min={min}
              span={span}
              referenceMedianMs={referenceMedianMs}
              onCellClick={onCellClick}
            />
          ))}
        </div>
      </div>
      <HeatLegend />
    </div>
  );
}

/** Faint glow used on weak-fact outlines (cell borders + the legend swatch). */
const WEAK_GLOW = '0 0 6px 0 color-mix(in srgb, var(--bad) 45%, transparent)';

/**
 * The fast→slow ramp + weak-fact swatch, replacing the prose that used to
 * describe the ramp (ui-redesign/02 §C). Schematic, not chartjunk.
 */
function HeatLegend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.625rem] text-text-faint">
      <span className="flex items-center gap-1.5">
        <span>Fast</span>
        <span className="flex gap-px">
          {[0, 1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ backgroundColor: `var(--heat-${n})` }}
            />
          ))}
        </span>
        <span>Slow</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-[3px] border-2"
          style={{ borderColor: 'var(--bad)', boxShadow: WEAK_GLOW }}
        />
        <span>weak fact</span>
      </span>
    </div>
  );
}

function FragmentRow({
  r,
  byKey,
  min,
  span,
  referenceMedianMs,
  onCellClick,
}: {
  r: number;
  byKey: Map<string, FactStat>;
  min: number;
  span: number;
  referenceMedianMs: number;
  onCellClick: (factKey: string) => void;
}) {
  return (
    <>
      <div className="flex items-center text-[0.5rem] text-text-dim">{r}</div>
      {RANGE.map((c) => {
        const key = keyFor(r, c);
        const fact = byKey.get(key);
        const has = fact && fact.attempts >= 3;
        const accuracy = fact && fact.attempts ? fact.correct / fact.attempts : 0;
        const weak =
          !!fact &&
          isWeakFact({
            attempts: fact.attempts,
            accuracy,
            medianLatencyMs: fact.medianLatencyMs,
            referenceMedianMs,
          });
        const norm = has ? (fact.medianLatencyMs - min) / span : 0;
        return (
          <button
            key={key}
            type="button"
            disabled={!has}
            onClick={() => onCellClick(key)}
            title={
              has
                ? `${r} × ${c} · ${formatLatency(fact.medianLatencyMs)} · ${Math.round(accuracy * 100)}%`
                : `${r} × ${c} · no data`
            }
            className="h-5 w-5 rounded-[3px] border transition-transform duration-fast ease-out-t hover:scale-110 disabled:cursor-default disabled:hover:scale-100"
            style={{
              backgroundColor: has ? heatColor(norm) : 'var(--surface-2)',
              borderColor: weak ? 'var(--bad)' : 'transparent',
              borderWidth: weak ? 2 : 1,
              boxShadow: weak ? WEAK_GLOW : undefined,
              opacity: has ? 1 : 0.35,
            }}
          />
        );
      })}
    </>
  );
}

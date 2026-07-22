import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Eyebrow } from '@/ui/primitives';
import { Chip, SegmentedControl, type ChipTone } from '@/ui/kit';
import {
  DRILL_CATALOG,
  buildDrillFromTag,
  buildFactDrill,
  useDrillStore,
  type TierMode,
} from '@/store/drills';
import { loadDashboard, type SkillRow } from '@/store/dashboard';
import { formatAccuracy, formatLatency } from '@/lib/format';
import type { Mastery, SkillTag } from '@/engine';

function MasteryChip({ level }: { level: Mastery }) {
  const tone: ChipTone =
    level === 'solid' ? 'good' : level === 'learning' ? 'accent' : 'neutral';
  return <Chip tone={tone}>{level}</Chip>;
}

const COUNTS = [10, 25, 50];
const TIERS: TierMode[] = [1, 2, 3, 'adaptive'];

export function DrillsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setPending = useDrillStore((s) => s.setPending);

  const [stats, setStats] = useState<Record<string, SkillRow>>({});
  const [count, setCount] = useState(10);
  const [input, setInput] = useState<'flow' | 'test'>('flow');
  const [tier, setTier] = useState<TierMode>('adaptive');

  useEffect(() => {
    let alive = true;
    loadDashboard().then((d) => {
      if (!alive) return;
      const map: Record<string, SkillRow> = {};
      for (const row of d.skills) map[row.tag] = row;
      setStats(map);
    });
    return () => {
      alive = false;
    };
  }, []);

  const start = useMemo(
    () => (tag: SkillTag, opts?: { count?: number; input?: 'flow' | 'test'; tier?: TierMode }) => {
      setPending(
        buildDrillFromTag(tag, {
          count: opts?.count ?? count,
          input: opts?.input ?? input,
          tierMode: opts?.tier ?? tier,
        }),
      );
      navigate('/drills/play');
    },
    [count, input, tier, navigate, setPending],
  );

  // Deep-link auto-start: a skill/heatmap click-through pre-configures a drill.
  useEffect(() => {
    const tag = params.get('tag') as SkillTag | null;
    const fact = params.get('fact');
    if (tag) {
      start(tag, { input: 'flow', tier: 'adaptive', count: 10 });
    } else if (fact) {
      const meta = buildFactDrill(fact, { count: 10 });
      if (meta) {
        setPending(meta);
        navigate('/drills/play');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-mono text-2xl font-semibold text-text">Skill drills</h1>
        <p className="mt-1 text-sm text-text-dim">
          Volume practice on one family. Accuracy and median latency below are your
          live stats — the catalog doubles as a weakness display.
        </p>
      </div>

      {/* Config bar */}
      <Card>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <ConfigGroup
            label="Length"
            options={COUNTS.map((c) => ({ value: c, label: `${c}` }))}
            value={count}
            onChange={setCount}
          />
          <ConfigGroup
            label="Input"
            options={[
              { value: 'flow' as const, label: 'Flow' },
              { value: 'test' as const, label: 'Test' },
            ]}
            value={input}
            onChange={setInput}
          />
          <ConfigGroup
            label="Difficulty"
            options={TIERS.map((t) => ({ value: t, label: t === 'adaptive' ? 'Adaptive' : `T${t}` }))}
            value={tier}
            onChange={setTier}
          />
        </div>
      </Card>

      {DRILL_CATALOG.map((group) => (
        <Card key={group.category}>
          <Eyebrow>{group.category}</Eyebrow>
          <div className="mt-2 divide-y divide-border/60">
            {group.tags.map((tag) => {
              const s = stats[tag];
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => start(tag)}
                  className="group flex w-full items-center gap-4 py-2 text-left"
                >
                  <span className="w-28 shrink-0 font-mono text-sm text-text">{tag}</span>
                  <span className="flex-1 text-xs text-text-dim">
                    {s
                      ? `${formatAccuracy(s.accuracy)} · ${s.medianMs ? formatLatency(s.medianMs) : '—'}`
                      : 'no data yet'}
                  </span>
                  {s && <MasteryChip level={s.mastery} />}
                  <span className="text-xs text-text-faint transition-[transform,color] duration-fast ease-spring-t group-hover:translate-x-0.5 group-hover:text-accent">
                    Drill →
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * A labeled drill-config picker. Wraps the kit SegmentedControl (role=radiogroup)
 * so every single-select group in the app shares one accessible component; values
 * may be numbers/mixed, so they round-trip through their string form.
 */
function ConfigGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-dim">{label}</span>
      <SegmentedControl
        size="sm"
        ariaLabel={label}
        value={String(value)}
        options={options.map((o) => ({ value: String(o.value), label: o.label }))}
        onChange={(v) => {
          const match = options.find((o) => String(o.value) === v);
          if (match) onChange(match.value);
        }}
      />
    </div>
  );
}

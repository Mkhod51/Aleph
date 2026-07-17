import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Eyebrow, NavCard } from '@/ui/primitives';
import { PresetPanel } from '@/ui/PresetPanel';
import { durationLabel } from '@/lib/format';
import { usePresetStore, findPreset } from '@/store/usePresetStore';
import { buildPlanFromPreset, presetHasAnyOp } from '@/store/presets';
import { sessionRepo } from '@/store/repos/sessionRepo';

/** Tiny inline bar sparkline for the last-7 scores (heavier charts stay on /stats). */
function Sparkline({ scores }: { scores: number[] }) {
  const max = Math.max(...scores, 1);
  return (
    <div className="flex h-10 items-end gap-1" aria-hidden>
      {scores.map((s, i) => (
        <div
          key={i}
          className="w-3 rounded-sm bg-accent/80"
          style={{ height: `${Math.max(6, (s / max) * 100)}%` }}
          title={String(s)}
        />
      ))}
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const selected = usePresetStore((s) => findPreset(s.custom, s.selectedId));
  const canPlay = presetHasAnyOp(selected);

  const [recent, setRecent] = useState<number[] | null>(null);
  useEffect(() => {
    let alive = true;
    const { configHash } = buildPlanFromPreset(selected);
    sessionRepo.completedByConfig(configHash).then((list) => {
      if (alive) setRecent(list.slice(0, 7).reverse().map((s) => s.score));
    });
    return () => {
      alive = false;
    };
  }, [selected]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Primary action */}
      <div className="flex flex-col items-center gap-4 pt-6 text-center">
        <button
          type="button"
          autoFocus
          disabled={!canPlay}
          onClick={() => navigate('/play')}
          className="rounded-btn bg-accent px-8 py-4 font-mono text-lg font-semibold text-bg transition-transform hover:brightness-110 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          ▶ START SPRINT — {durationLabel(selected.durationMs)}
        </button>

        <PresetPanel />

        <button
          type="button"
          disabled
          title="Unlocks after 100 answered questions of history."
          className="cursor-not-allowed rounded-btn border border-border px-3 py-1 text-sm text-text-dim opacity-60"
        >
          Fix my gaps →
        </button>
      </div>

      {/* Daily + streak */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <Eyebrow>Daily challenge</Eyebrow>
          <p className="mt-2 text-sm text-text-dim">
            A fixed 120-second sprint, the same for everyone each day. Arrives in
            the habit layer.
          </p>
        </Card>
        <Card>
          <Eyebrow>Streak</Eyebrow>
          <p className="mt-2 text-sm text-text-dim">
            Play your first daily to start a streak.
          </p>
        </Card>
      </div>

      {/* Recent history */}
      <Card>
        <Eyebrow>Last 7 sprints · {selected.name}</Eyebrow>
        {recent && recent.length > 0 ? (
          <div className="mt-3 flex items-center gap-4">
            <span className="font-mono text-sm tabular-nums text-text-dim">
              {recent[0]}
            </span>
            <Sparkline scores={recent} />
            <span className="font-mono text-sm tabular-nums text-text">
              {recent[recent.length - 1]}
            </span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-text-dim">
            No sessions yet for this preset. Two minutes gets you a baseline.
          </p>
        )}
      </Card>

      {/* Shortcuts */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <NavCard to="/sims" title="Sims" hint="Firm-accurate tests" />
        <NavCard to="/drills" title="Drills" hint="One skill at a time" />
        <NavCard to="/learn" title="Learn" hint="Techniques + tables" />
        <NavCard to="/stats" title="Stats" hint="Progress + weak spots" />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Eyebrow, NavCard } from '@/ui/primitives';
import { PresetPanel } from '@/ui/PresetPanel';
import { durationLabel } from '@/lib/format';
import { usePresetStore, findPreset } from '@/store/usePresetStore';
import { buildPlanFromPreset, presetHasAnyOp } from '@/store/presets';
import { sessionRepo } from '@/store/repos/sessionRepo';
import { dailyRepo } from '@/store/repos/dailyRepo';
import { todayKey } from '@/store/daily';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useStreakStore } from '@/store/streak';
import { dueCount } from '@/store/srs';
import {
  loadWeaknessSummary,
  composeFixMyGaps,
  FIX_GAPS_MIN_ATTEMPTS,
  type WeaknessSummary,
} from '@/store/weakness';
import { useDrillStore } from '@/store/drills';

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

function Onboarding() {
  const navigate = useNavigate();
  const update = useSettingsStore((s) => s.update);
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-20 text-center">
      <h1 className="font-mono text-2xl font-semibold text-text">
        This trains you for quant trading math tests.
      </h1>
      <p className="text-text-dim">
        Zetamac-style speed drills, firm test simulators, and a weakness engine —
        all local to your browser.
      </p>
      <button
        type="button"
        autoFocus
        onClick={() => {
          update({ onboarded: true });
          navigate('/play?seconds=60');
        }}
        className="rounded-btn bg-accent px-6 py-3 font-mono font-semibold text-bg hover:brightness-110"
      >
        Take the 60-second baseline
      </button>
      <button
        type="button"
        onClick={() => update({ onboarded: true })}
        className="text-sm text-text-dim hover:text-text"
      >
        Skip, just let me play
      </button>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const onboarded = useSettingsStore((s) => s.onboarded);
  const selected = usePresetStore((s) => findPreset(s.custom, s.selectedId));
  const streak = useStreakStore();
  const setPending = useDrillStore((s) => s.setPending);
  const canPlay = presetHasAnyOp(selected);

  const [recent, setRecent] = useState<number[] | null>(null);
  const [due, setDue] = useState(0);
  const [weakness, setWeakness] = useState<WeaknessSummary | null>(null);
  // Today's daily score, or null when today's daily hasn't been played (F5).
  const [dailyScore, setDailyScore] = useState<number | null>(null);

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

  useEffect(() => {
    let alive = true;
    dueCount().then((n) => alive && setDue(n));
    loadWeaknessSummary().then((w) => alive && setWeakness(w));
    dailyRepo.get(todayKey()).then((r) => alive && setDailyScore(r?.score ?? null));
    return () => {
      alive = false;
    };
  }, []);

  if (!onboarded) return <Onboarding />;

  const fixGaps = () => {
    if (!weakness?.canFix) return;
    setPending(composeFixMyGaps(weakness.weakTags));
    navigate('/drills/play');
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
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
          disabled={!weakness?.canFix}
          onClick={fixGaps}
          title={
            weakness?.canFix
              ? 'A 25-question drill: 70% your weak spots, 30% variety.'
              : `Unlocks after ${FIX_GAPS_MIN_ATTEMPTS} answered questions.`
          }
          className="rounded-btn border border-border px-3 py-1 text-sm text-text-dim transition-colors hover:border-accent hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
        >
          Fix my gaps →
          {weakness && !weakness.canFix && (
            <span className="ml-1 opacity-70">
              ({weakness.totalQuestions}/{FIX_GAPS_MIN_ATTEMPTS})
            </span>
          )}
        </button>
      </div>

      {/* Daily + SRS */}
      <div className="grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={() => navigate('/daily')} className="text-left">
          <Card className="h-full transition-colors hover:border-accent hover:bg-surface-2">
            <Eyebrow>Daily challenge</Eyebrow>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-mono text-xl text-text">🔥 {streak.current}</span>
              <span className="text-sm text-text-dim">
                day streak{streak.best > 0 ? ` · best ${streak.best}` : ''}
              </span>
            </div>
            <div className="mt-2 font-mono text-sm text-text-dim">
              {dailyScore !== null ? (
                <span className="text-good">✓ Done today · {dailyScore}</span>
              ) : (
                <span className="text-accent">▶ Play today’s 120s</span>
              )}
            </div>
          </Card>
        </button>
        <button type="button" onClick={() => navigate('/srs')} className="text-left">
          <Card className="h-full transition-colors hover:border-accent hover:bg-surface-2">
            <Eyebrow>Flashcards</Eyebrow>
            <div className="mt-2 font-mono text-xl text-text">
              {due > 0 ? `⚡ ${due} due` : 'None due'}
            </div>
          </Card>
        </button>
      </div>

      <Card>
        <Eyebrow>Last 7 sprints · {selected.name}</Eyebrow>
        {recent && recent.length > 0 ? (
          <div className="mt-3 flex items-center gap-4">
            <span className="font-mono text-sm tabular-nums text-text-dim">{recent[0]}</span>
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <NavCard to="/sims" title="Sims" hint="Firm-accurate tests" />
        <NavCard to="/drills" title="Drills" hint="One skill at a time" />
        <NavCard to="/learn" title="Learn" hint="Techniques + tables" />
        <NavCard to="/stats" title="Stats" hint="Progress + weak spots" />
      </div>
    </div>
  );
}

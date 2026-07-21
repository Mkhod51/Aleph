import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Eyebrow, NavCard } from '@/ui/primitives';
import { StatTile } from '@/ui/kit';
import { Button } from '@/ui/Button';
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
    // Height is a multiple of the 24px grid rhythm (ui-redesign/03 §Home).
    <div className="flex h-12 items-end gap-1" aria-hidden>
      {scores.map((s, i) => (
        <div
          key={i}
          className="w-3 rounded-sm border-t-2 border-accent-hi bg-accent/70"
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
    // Onboarding hero: gridfield texture + HeroReadout-style framed title. The
    // two CTAs get a one-shot spring-in (animate-pop); the global reduced-motion
    // override collapses it to instant (ui-redesign/03 §Home, motion H1).
    <div className="panel gridfield mx-auto flex max-w-lg flex-col items-center gap-5 rounded-card px-6 py-16 text-center">
      <h1 className="border-y border-border py-4 font-mono text-2xl font-semibold tracking-[-0.01em] text-text">
        This trains you for quant trading math tests.
      </h1>
      <p className="text-text-dim">
        Zetamac-style speed drills, firm test simulators, and a weakness engine —
        all local to your browser.
      </p>
      <Button
        variant="primary"
        size="lg"
        mono
        autoFocus
        className="animate-pop"
        onClick={() => {
          update({ onboarded: true });
          navigate('/play?seconds=60');
        }}
      >
        Take the 60-second baseline
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="animate-pop [animation-delay:60ms]"
        onClick={() => update({ onboarded: true })}
      >
        Skip, just let me play
      </Button>
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
      {/* Hero band — the signature gridfield texture behind START + the preset
          panel, seen first (ui-redesign/03 §Home). */}
      <div className="panel gridfield flex flex-col items-center gap-5 rounded-card px-4 py-8 text-center">
        <Button
          variant="primary"
          size="lg"
          mono
          autoFocus
          disabled={!canPlay}
          onClick={() => navigate('/play')}
          className="px-8 py-4"
        >
          ▶ START SPRINT — {durationLabel(selected.durationMs)}
        </Button>

        <PresetPanel />

        <Button
          variant="secondary"
          size="sm"
          disabled={!weakness?.canFix}
          onClick={fixGaps}
          title={
            weakness?.canFix
              ? 'A 25-question drill: 70% your weak spots, 30% variety.'
              : `Unlocks after ${FIX_GAPS_MIN_ATTEMPTS} answered questions.`
          }
        >
          Fix my gaps →
          {weakness && !weakness.canFix && (
            <span className="ml-1 opacity-70">
              ({weakness.totalQuestions}/{FIX_GAPS_MIN_ATTEMPTS})
            </span>
          )}
        </Button>
      </div>

      {/* Daily + SRS */}
      <div className="grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={() => navigate('/daily')} className="text-left">
          <Card hover className="h-full">
            <StatTile
              label="Daily challenge"
              value={<>🔥 {streak.current}</>}
              sub={`day streak${streak.best > 0 ? ` · best ${streak.best}` : ''}`}
            />
            <div className="mt-3 font-mono text-sm">
              {dailyScore !== null ? (
                <span className="text-good">✓ Done today · {dailyScore}</span>
              ) : (
                <span className="text-accent">▶ Play today’s 120s</span>
              )}
            </div>
          </Card>
        </button>
        <button type="button" onClick={() => navigate('/srs')} className="text-left">
          <Card hover className="h-full">
            <StatTile
              label="Flashcards"
              value={due > 0 ? <>⚡ {due}</> : 'None due'}
              sub={due > 0 ? 'Review now →' : 'All caught up'}
            />
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

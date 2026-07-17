import { useNavigate } from 'react-router-dom';
import { Card, Eyebrow, NavCard } from '@/ui/primitives';

/**
 * Home — "two keys to the first question" (doc 07 §4). M0 renders the themed
 * empty state; live presets, daily, streak and the last-7 sparkline arrive with
 * their milestones. The Start button is autofocused (doc 03 §2 acceptance).
 */
export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Primary action */}
      <div className="flex flex-col items-center gap-3 pt-6 text-center">
        <button
          type="button"
          autoFocus
          onClick={() => navigate('/play')}
          className="rounded-btn bg-accent px-8 py-4 font-mono text-lg font-semibold text-bg transition-transform hover:brightness-110 focus-visible:outline-none"
        >
          ▶ START SPRINT — 120s default
        </button>
        <div className="flex items-center gap-3 text-sm text-text-dim">
          <span className="cursor-not-allowed rounded-btn border border-border px-3 py-1 opacity-60">
            Zetamac Default ▾
          </span>
          <span
            className="cursor-not-allowed rounded-btn border border-border px-3 py-1 opacity-60"
            title="Unlocks after 100 answered questions of history."
          >
            Fix my gaps →
          </span>
        </div>
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

      {/* Recent history empty state */}
      <Card>
        <Eyebrow>Last 7 sprints</Eyebrow>
        <p className="mt-2 text-sm text-text-dim">
          No sessions yet. Two minutes gets you a baseline.
        </p>
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

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getResultData, type ResultData } from '@/store/sessionService';
import { bandsForSession } from '@/store/bands';
import { bandFor, BAND_DISCLAIMER } from '@/content/bands';
import { techniqueForTag } from '@/content/techniques';
import { buildDrillFromTag, useDrillStore } from '@/store/drills';
import { Button } from '@/ui/Button';
import { BandGauge } from '@/ui/BandGauge';
import type { SkillTag } from '@/engine';
import type { Attempt } from '@/store/types';
import {
  formatAccuracy,
  formatLatency,
  formatPerMin,
  formatSignedDelta,
} from '@/lib/format';

type SortMode = 'worst' | 'latency' | 'order';

function sortAttempts(attempts: Attempt[], mode: SortMode): Attempt[] {
  const rows = [...attempts];
  if (mode === 'order') return rows.sort((a, b) => a.index - b.index);
  if (mode === 'latency') return rows.sort((a, b) => b.totalMs - a.totalMs);
  // 'worst': wrong/unanswered first, then slowest-correct (doc 03 §1.3).
  return rows.sort((a, b) => {
    const aWrong = a.correct ? 0 : 1;
    const bWrong = b.correct ? 0 : 1;
    if (aWrong !== bWrong) return bWrong - aWrong;
    return b.totalMs - a.totalMs;
  });
}

/**
 * Count 0 → target over --dur-moment (400 ms) with an eased rAF loop (M1/M2).
 * Skips straight to the final value under reduced-motion, when the tab is
 * hidden, or when `animate` is false (abandoned sessions show a static score).
 * The returned value drives both the hero number and the band-gauge marker, so
 * they share one clock with no second timer.
 */
function useCountUp(target: number, animate: boolean): number {
  const [display, setDisplay] = useState(target);
  useLayoutEffect(() => {
    if (!animate) {
      setDisplay(target);
      return;
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || document.hidden) {
      setDisplay(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const DURATION = 400; // --dur-moment
    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
    const step = (ts: number) => {
      const p = Math.min(1, (ts - start) / DURATION);
      setDisplay(Math.round(target * easeOutCubic(p)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, animate]);
  return display;
}

function Vital({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-lg tabular-nums text-text">{value}</span>
      <span className="text-[0.75rem] uppercase tracking-wide text-text-dim">
        {label}
      </span>
    </div>
  );
}

export function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ResultData | null | 'missing'>(null);
  const [sortMode, setSortMode] = useState<SortMode>('worst');

  useEffect(() => {
    let alive = true;
    if (!sessionId) return;
    getResultData(sessionId).then((d) => {
      if (alive) setData(d ?? 'missing');
    });
    return () => {
      alive = false;
    };
  }, [sessionId]);

  const rows = useMemo(
    () => (data && data !== 'missing' ? sortAttempts(data.attempts, sortMode) : []),
    [data, sortMode],
  );

  const navSession = data && data !== 'missing' ? data.session : null;
  const onAgain = useCallback(() => {
    if (navSession?.mode === 'sim' && navSession.simId) {
      navigate(`/sims/${navSession.simId}/play`);
    } else navigate('/play');
  }, [navigate, navSession]);
  const onNew = useCallback(
    () => navigate(navSession?.mode === 'sim' ? '/sims' : '/'),
    [navigate, navSession],
  );
  const onDashboard = useCallback(() => navigate('/stats'), [navigate]);

  const setPending = useDrillStore((s) => s.setPending);
  const drillLike = useCallback(
    (tag: SkillTag) => {
      setPending(buildDrillFromTag(tag, { count: 10, input: 'flow', tierMode: 'adaptive' }));
      navigate('/drills/play');
    },
    [navigate, setPending],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'Enter') onAgain();
      else if (e.key.toLowerCase() === 'n') onNew();
      else if (e.key.toLowerCase() === 'd') onDashboard();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onAgain, onNew, onDashboard]);

  // M1/M2: the hero counts up only for a completed session; abandoned sessions
  // (and reduced-motion) show the final score instantly. Same value feeds the
  // gauge marker so both move on one clock.
  const heroTarget = data && data !== 'missing' ? data.session.score : 0;
  const heroAnimate = data && data !== 'missing' ? data.session.completed : false;
  const displayScore = useCountUp(heroTarget, heroAnimate);

  if (data === null) {
    return <p className="py-16 text-center text-text-dim">Loading results…</p>;
  }
  if (data === 'missing') {
    return (
      <div className="py-16 text-center">
        <p className="text-text-dim">That session wasn&apos;t found.</p>
        <Button variant="secondary" size="md" onClick={onNew} className="mt-3">
          ← Home
        </Button>
      </div>
    );
  }

  const { session, vitals } = { session: data.session, vitals: data.session.vitals };
  const bands = bandsForSession(session);
  const band = bands ? bandFor(session.score, bands) : null;
  // Give the top band a visible width and keep the marker off the right edge.
  const gaugeMax = bands
    ? Math.max(Math.ceil(bands[bands.length - 1].min / 0.8), session.score)
    : 0;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Hero */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-hero font-semibold tabular-nums text-text">
              {session.score}
            </span>
            <span className="text-sm text-text-dim">
              {session.completed ? 'correct' : 'abandoned'}
            </span>
          </div>
          {band && (
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: band.color }}
                aria-hidden
              />
              <span className="font-medium text-text">{band.label}</span>
              <span className="text-text-dim">· {BAND_DISCLAIMER}</span>
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {data.deltaVsLast7 !== null && (
              <span className="text-text-dim">
                {formatSignedDelta(Math.round(data.deltaVsLast7))} vs last-7
              </span>
            )}
            {data.best !== null && (
              <span className="text-text-dim">PB {data.best}</span>
            )}
            {session.extended && (
              <span className="text-accent">Not Zetamac-comparable</span>
            )}
          </div>
        </div>
        {data.isNewPB && (
          <div className="rounded-btn border border-accent px-3 py-1 text-sm font-medium text-accent">
            New best
          </div>
        )}
      </div>

      {/* Vitals */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        <Vital label="attempted" value={String(vitals.attempted)} />
        <Vital label="correct" value={String(vitals.correct)} />
        <Vital label="wrong" value={String(vitals.wrong)} />
        <Vital label="accuracy" value={formatAccuracy(vitals.accuracy)} />
        <Vital label="med latency" value={formatLatency(vitals.medianLatencyMs)} />
        <Vital label="throughput" value={formatPerMin(vitals.perMin)} />
      </div>

      {/* Review table */}
      <div className="overflow-x-auto">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-text-dim">
            Review
          </h2>
          <div className="flex gap-1 text-xs">
            {(['worst', 'latency', 'order'] as SortMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSortMode(m)}
                className={`rounded-btn px-2 py-1 ${
                  sortMode === m
                    ? 'bg-surface-2 text-text'
                    : 'text-text-dim hover:text-text'
                }`}
              >
                {m === 'worst' ? 'Worst first' : m === 'latency' ? 'Slowest' : 'Order'}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-dim">
              <th className="py-2 pr-3 font-medium"> </th>
              <th className="py-2 pr-3 font-medium">Question</th>
              <th className="py-2 pr-3 font-medium">You</th>
              <th className="py-2 pr-3 font-medium">Answer</th>
              <th className="py-2 pr-3 text-right font-medium">Latency</th>
              <th className="py-2 pr-3 font-medium">Skill</th>
              <th className="py-2 font-medium">Coach</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-border/60">
                <td className="py-2 pr-3">
                  {a.correct ? (
                    <span className="text-good" aria-label="correct">
                      ✓
                    </span>
                  ) : (
                    <span className="text-bad" aria-label="wrong">
                      ✗
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3 text-text">{a.prompt}</td>
                <td className={`py-2 pr-3 ${a.correct ? 'text-text-dim' : 'text-bad'}`}>
                  {a.given ?? '—'}
                </td>
                <td className="py-2 pr-3 text-text">{a.answerCanonical}</td>
                <td className="py-2 pr-3 text-right text-text-dim">
                  {formatLatency(a.totalMs)}
                </td>
                <td className="py-2 pr-3 font-sans text-xs text-text-dim">{a.skill}</td>
                <td className="py-2 font-sans text-xs">
                  {(() => {
                    const tech = techniqueForTag(a.skill);
                    return (
                      <span className="flex gap-2">
                        {tech && (
                          <Link
                            to={`/learn/${tech.slug}`}
                            className="text-accent hover:underline"
                          >
                            trick {tech.id}
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => drillLike(a.skill)}
                          className="text-accent hover:underline"
                        >
                          drill
                        </button>
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onAgain}
          className="rounded-btn bg-accent px-5 py-2 font-medium text-bg hover:brightness-110"
        >
          Again <span className="opacity-70">↵</span>
        </button>
        <button
          type="button"
          onClick={onNew}
          className="rounded-btn border border-border px-5 py-2 text-text-dim hover:border-accent hover:text-text"
        >
          New config <span className="opacity-70">N</span>
        </button>
        <button
          type="button"
          onClick={onDashboard}
          className="rounded-btn border border-border px-5 py-2 text-text-dim hover:border-accent hover:text-text"
        >
          Dashboard <span className="opacity-70">D</span>
        </button>
      </div>
    </div>
  );
}

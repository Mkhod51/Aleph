import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getResultData, type ResultData } from '@/store/sessionService';
import { bandsForSession } from '@/store/bands';
import { bandFor, BAND_DISCLAIMER } from '@/content/bands';
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

  const onAgain = useCallback(() => navigate('/play'), [navigate]);
  const onNew = useCallback(() => navigate('/'), [navigate]);
  const onDashboard = useCallback(() => navigate('/stats'), [navigate]);

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

  if (data === null) {
    return <p className="py-16 text-center text-text-dim">Loading results…</p>;
  }
  if (data === 'missing') {
    return (
      <div className="py-16 text-center">
        <p className="text-text-dim">That session wasn&apos;t found.</p>
        <button
          type="button"
          onClick={onNew}
          className="mt-3 rounded-btn border border-border px-4 py-2 text-sm text-text-dim hover:border-accent hover:text-text"
        >
          ← Home
        </button>
      </div>
    );
  }

  const { session, vitals } = { session: data.session, vitals: data.session.vitals };
  const bands = bandsForSession(session);
  const band = bands ? bandFor(session.score, bands) : null;

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
              <th className="py-2 font-medium">Skill</th>
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
                <td className="py-2 font-sans text-xs text-text-dim">{a.skill}</td>
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

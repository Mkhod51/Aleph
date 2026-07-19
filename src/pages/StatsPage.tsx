import { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Eyebrow } from '@/ui/primitives';
import { Button } from '@/ui/Button';
import { Heatmap } from '@/ui/stats/Heatmap';
import { Calendar } from '@/ui/stats/Calendar';
import { BandGauge } from '@/ui/BandGauge';
import { loadDashboard, type DashboardData, type SkillRow } from '@/store/dashboard';
import { SPRINT_BANDS, BAND_DISCLAIMER, bandsForKind } from '@/content/bands';
import {
  formatAccuracy,
  formatLatency,
} from '@/lib/format';
import type { Mastery } from '@/engine';

const ScoreChart = lazy(() => import('@/ui/stats/ScoreChart'));

const TREND: Record<string, string> = { '1': '▲', '0': '—', '-1': '▼' };

function MasteryChip({ level }: { level: Mastery }) {
  const cls =
    level === 'solid'
      ? 'text-good'
      : level === 'learning'
        ? 'text-accent'
        : 'text-text-dim';
  return <span className={`text-xs ${cls}`}>{level}</span>;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-2xl tabular-nums text-text">{value}</span>
      <span className="text-[0.75rem] uppercase tracking-wide text-text-dim">
        {label}
      </span>
      {sub && <span className="text-xs text-text-dim">{sub}</span>}
    </div>
  );
}

function SkillBar({ row, onClick }: { row: SkillRow; onClick: () => void }) {
  const over = row.medianMs > row.targetMs;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-1.5 text-left hover:opacity-90"
    >
      <span className="w-24 shrink-0 font-mono text-xs text-text">{row.tag}</span>
      <span className="relative h-4 flex-1 overflow-hidden rounded-sm bg-surface-2">
        <span
          className="absolute inset-y-0 left-0 bg-accent/70"
          style={{ width: `${Math.round(row.accuracy * 100)}%` }}
        />
      </span>
      <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-text-dim">
        {formatAccuracy(row.accuracy)}
      </span>
      <span
        className={`w-12 shrink-0 text-right font-mono text-xs tabular-nums ${over ? 'text-bad' : 'text-text-dim'}`}
      >
        {row.medianMs ? formatLatency(row.medianMs) : '—'}
      </span>
      <MasteryChip level={row.mastery} />
    </button>
  );
}

export function StatsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    let alive = true;
    loadDashboard().then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (data && !data.hasData) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="font-mono text-2xl font-semibold text-text">Dashboard</h1>
        <p className="mt-3 text-text-dim">
          No sessions yet. Two minutes gets you a baseline — then this fills with
          score trends, a skill breakdown, a times-table heatmap and a consistency
          calendar.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/play')}
          className="mt-4"
        >
          Play a sprint
        </Button>
      </div>
    );
  }

  // C6: render the page shell immediately and reserve vertical space so the brief
  // IndexedDB read never flashes a centered "Loading…" line that then jumps the
  // whole layout in. No spinner, no skeleton shimmer — just a stable container.
  if (!data) {
    return (
      <div className="mx-auto flex max-w-content flex-col gap-6">
        <h1 className="font-mono text-2xl font-semibold text-text">Dashboard</h1>
        <div className="min-h-[60vh]" aria-hidden />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-content flex-col gap-6">
      <h1 className="font-mono text-2xl font-semibold text-text">Dashboard</h1>

      {/* 1. Headline strip */}
      <Card>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat
            label="Sprint avg (7)"
            value={data.sprintRolling7 !== null ? data.sprintRolling7.toFixed(0) : '—'}
            sub={
              data.sprintBandLabel
                ? `${TREND[String(data.sprintTrend ?? 0)]} ${data.sprintBandLabel} · ${BAND_DISCLAIMER}`
                : undefined
            }
          />
          <Stat label="Sessions" value={String(data.totalSessions)} />
          <Stat label="Questions" value={String(data.totalQuestions)} />
          <Stat label="SRS due" value="—" sub="arrives in M5" />
        </div>
      </Card>

      {/* 2. Score over time */}
      <Card>
        <Eyebrow>Sprint score over time · Zetamac default</Eyebrow>
        {data.sprintSeries.length > 0 ? (
          <div className="mt-3">
            <Suspense
              fallback={<div className="h-[240px] rounded bg-surface-2" />}
            >
              <ScoreChart
                data={data.sprintSeries}
                bands={SPRINT_BANDS}
                onPointClick={(id) => navigate(`/results/${id}`)}
              />
            </Suspense>
          </div>
        ) : (
          <p className="mt-2 text-sm text-text-dim">
            Play the Zetamac Default preset to chart benchmark-comparable scores.
          </p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 3. Skill breakdown */}
        <Card>
          <Eyebrow>Skill breakdown · worst first</Eyebrow>
          {data.skills.length > 0 ? (
            <div className="mt-2 divide-y divide-border/60">
              {data.skills.map((row) => (
                <SkillBar
                  key={row.tag}
                  row={row}
                  onClick={() => navigate(`/drills?tag=${row.tag}`)}
                />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-text-dim">No skill data yet.</p>
          )}
        </Card>

        {/* 4. Times-table heatmap */}
        <Card>
          <Eyebrow>Times-table heatmap · median latency</Eyebrow>
          {data.facts.some((f) => f.attempts >= 3) ? (
            <div className="mt-3">
              <Heatmap
                facts={data.facts}
                referenceMedianMs={data.factReferenceMedianMs}
                onCellClick={(factKey) =>
                  navigate(`/drills?fact=${encodeURIComponent(factKey)}`)
                }
              />
              <p className="mt-2 text-xs text-text-dim">
                Fast → slow. Red outline = weak fact. Click a cell to drill it.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-text-dim">
              Answer more multiplication facts (both operands ≤ 20) to light up the
              grid.
            </p>
          )}
        </Card>
      </div>

      {/* 6. Sim readiness */}
      {data.simReadiness.length > 0 && (
        <Card>
          <Eyebrow>Sim readiness · {BAND_DISCLAIMER}</Eyebrow>
          <div className="mt-3 flex flex-col gap-5">
            {data.simReadiness.map((r) => {
              const bands = bandsForKind(r.bandKind);
              return (
                <div key={r.simId}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="text-text">{r.name}</span>
                    <span className="font-mono tabular-nums text-text-dim">
                      latest {r.latest} · best {r.best}
                    </span>
                  </div>
                  {bands && <BandGauge bands={bands} max={r.count} value={r.latest} />}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 5. Consistency calendar */}
      <Card>
        <Eyebrow>Consistency · last 26 weeks</Eyebrow>
        <div className="mt-3">
          <Calendar perDay={data.perDay} />
        </div>
      </Card>

      {/* 7. Fatigue */}
      {data.fatigue && (
        <Card>
          <Eyebrow>Fatigue · accuracy by quartile · last 10</Eyebrow>
          <div className="mt-3 flex items-end gap-3">
            {data.fatigue.map((acc, q) => (
              <div key={q} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-24 w-full items-end">
                  <div
                    className="w-full rounded-sm bg-accent/70"
                    style={{ height: `${Math.max(4, acc * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-text-dim">Q{q + 1}</span>
                <span className="font-mono text-xs tabular-nums text-text-dim">
                  {formatAccuracy(acc)}
                </span>
              </div>
            ))}
          </div>
          {data.fatigue[3]! - data.fatigue[0]! < -0.08 && (
            <p className="mt-2 text-xs text-accent">
              Accuracy drops late in sessions — build stamina with longer drills.
            </p>
          )}
        </Card>
      )}

      {/* 8. Records */}
      <Card>
        <Eyebrow>Records</Eyebrow>
        {data.records.length > 0 ? (
          <table className="mt-2 w-full text-sm">
            <tbody className="font-mono tabular-nums">
              {data.records.map((pb) => (
                <tr key={pb.key} className="border-b border-border/60">
                  <td className="py-1.5 text-text-dim">{pb.key}</td>
                  <td className="py-1.5 text-right text-text">{pb.score}</td>
                  <td className="py-1.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/results/${pb.sessionId}`)}
                    >
                      view
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-2 text-sm text-text-dim">
            Complete a sprint to set your first record.
          </p>
        )}
      </Card>
    </div>
  );
}

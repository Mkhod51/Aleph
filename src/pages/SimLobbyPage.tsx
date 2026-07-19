import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Eyebrow } from '@/ui/primitives';
import { Button } from '@/ui/Button';
import { BandGauge } from '@/ui/BandGauge';
import { getSim } from '@/content/sims';
import { bandsForKind, BAND_DISCLAIMER } from '@/content/bands';
import { loadSimStats, type SimStats } from '@/store/sims';
import { formatClock } from '@/lib/format';

export function SimLobbyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sim = getSim(id);
  const [stats, setStats] = useState<SimStats | null>(null);

  useEffect(() => {
    let alive = true;
    if (sim) loadSimStats(sim.id).then((s) => alive && setStats(s));
    return () => {
      alive = false;
    };
  }, [sim]);

  if (!sim) {
    return (
      <div className="py-16 text-center text-text-dim">
        Unknown sim.{' '}
        <button className="text-accent underline" onClick={() => navigate('/sims')}>
          Back to sims
        </button>
      </div>
    );
  }

  const bands = bandsForKind(sim.bandKind);
  const last3 = stats?.sessions.slice(0, 3) ?? [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-mono text-2xl font-semibold text-text">{sim.name}</h1>
        <p className="mt-1 text-sm text-text-dim">
          {sim.count} questions · {formatClock(sim.durationMs)}
        </p>
      </div>

      <Card>
        <Eyebrow>Rules</Eyebrow>
        <ul className="mt-2 space-y-1 text-sm text-text-dim">
          {sim.rules.map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
      </Card>

      {bands && (
        <Card>
          <Eyebrow>Pass bars · {BAND_DISCLAIMER}</Eyebrow>
          <div className="mt-3">
            <BandGauge bands={bands} max={sim.count} value={stats?.best ?? null} />
          </div>
          {stats?.best != null && (
            <p className="mt-2 text-xs text-text-dim">
              Marker = your best net ({stats.best}).
            </p>
          )}
        </Card>
      )}

      <Card>
        <Eyebrow>Your last 3</Eyebrow>
        {last3.length > 0 ? (
          <div className="mt-2 flex gap-4 font-mono text-lg tabular-nums text-text">
            {last3.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => navigate(`/results/${s.id}`)}
                className="hover:text-accent"
              >
                {s.score}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-text-dim">No attempts yet.</p>
        )}
      </Card>

      <Button
        variant="primary"
        size="lg"
        mono
        autoFocus
        onClick={() => navigate(`/sims/${sim.id}/play`)}
      >
        ▶ Start {sim.name.split(' · ')[0]}
      </Button>
    </div>
  );
}

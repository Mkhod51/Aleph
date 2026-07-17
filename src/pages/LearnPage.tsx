import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Eyebrow } from '@/ui/primitives';
import { TECHNIQUES } from '@/content/techniques';
import { REFERENCES } from '@/content/references';
import { STRATEGY } from '@/content/strategy';
import { LEARN_CATEGORIES } from '@/content/learn';
import { loadDashboard } from '@/store/dashboard';
import type { Mastery } from '@/engine';

function Chip({ level }: { level: Mastery }) {
  const cls =
    level === 'solid'
      ? 'text-good'
      : level === 'learning'
        ? 'text-accent'
        : 'text-text-dim';
  return <span className={`text-xs ${cls}`}>{level}</span>;
}

export function LearnPage() {
  const [mastery, setMastery] = useState<Record<string, Mastery>>({});

  useEffect(() => {
    let alive = true;
    loadDashboard().then((d) => {
      if (!alive) return;
      const map: Record<string, Mastery> = {};
      for (const row of d.skills) map[row.tag] = row.mastery;
      setMastery(map);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-mono text-2xl font-semibold text-text">Learn</h1>
        <p className="mt-1 text-sm text-text-dim">
          Techniques wired to targeted drills, the recall tables, and test strategy.
        </p>
      </div>

      {LEARN_CATEGORIES.map((cat) => {
        const items = TECHNIQUES.filter((t) => t.category === cat);
        if (items.length === 0) return null;
        return (
          <Card key={cat}>
            <Eyebrow>{cat}</Eyebrow>
            <div className="mt-2 divide-y divide-border/60">
              {items.map((t) => (
                <Link
                  key={t.id}
                  to={`/learn/${t.slug}`}
                  className="flex items-center gap-3 py-2 hover:opacity-90"
                >
                  <span className="w-8 shrink-0 font-mono text-xs text-text-dim">{t.id}</span>
                  <span className="flex-1 text-sm text-text">{t.title}</span>
                  {t.masteryTag && <Chip level={mastery[t.masteryTag] ?? '—'} />}
                  <span className="text-xs text-accent">→</span>
                </Link>
              ))}
            </div>
          </Card>
        );
      })}

      <Card>
        <Eyebrow>Reference tables</Eyebrow>
        <div className="mt-2 divide-y divide-border/60">
          {REFERENCES.map((r) => (
            <Link
              key={r.id}
              to={`/learn/${r.slug}`}
              className="flex items-center gap-3 py-2 hover:opacity-90"
            >
              <span className="w-8 shrink-0 font-mono text-xs text-text-dim">{r.id}</span>
              <span className="flex-1 text-sm text-text">{r.title}</span>
              <span className="text-xs text-accent">→</span>
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <Eyebrow>Strategy</Eyebrow>
        <div className="mt-2 divide-y divide-border/60">
          {STRATEGY.map((s) => (
            <Link
              key={s.id}
              to={`/learn/${s.slug}`}
              className="flex items-center gap-3 py-2 hover:opacity-90"
            >
              <span className="w-8 shrink-0 font-mono text-xs text-text-dim">{s.id}</span>
              <span className="flex-1 text-sm text-text">{s.title}</span>
              <span className="text-xs text-accent">→</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

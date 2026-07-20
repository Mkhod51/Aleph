import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, Eyebrow } from '@/ui/primitives';
import { Button } from '@/ui/Button';
import { getTechnique, getTechniqueById } from '@/content/techniques';
import { getReference } from '@/content/references';
import { getStrategy } from '@/content/strategy';
import { buildDrillFromSpec, useDrillStore } from '@/store/drills';
import type { Technique } from '@/content/learn';

function TechniqueView({ t }: { t: Technique }) {
  const navigate = useNavigate();
  const setPending = useDrillStore((s) => s.setPending);

  const drillThis = () => {
    if (!t.drill) return;
    setPending(buildDrillFromSpec(t.title, t.drill));
    navigate('/drills/play');
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="font-mono text-xs text-text-dim">{t.id}</div>
        <h1 className="mt-1 font-mono text-2xl font-semibold text-text">{t.title}</h1>
        <p className="mt-2 text-text-dim">{t.hook}</p>
      </div>

      <Card>
        <Eyebrow>Method</Eyebrow>
        <p className="mt-2 text-sm leading-relaxed text-text">{t.method}</p>
      </Card>

      <Card>
        <Eyebrow>Worked examples</Eyebrow>
        <ul className="mt-2 space-y-1 font-mono text-sm text-text">
          {t.examples.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </Card>

      {(t.whenToUse || t.pitfall) && (
        <Card>
          {t.whenToUse && (
            <p className="text-sm text-text">
              <span className="text-text-dim">When: </span>
              {t.whenToUse}
            </p>
          )}
          {t.pitfall && (
            <p className="mt-2 text-sm text-text">
              <span className="text-bad">Pitfall: </span>
              {t.pitfall}
            </p>
          )}
        </Card>
      )}

      {t.drill && (
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="md"
            mono
            onClick={drillThis}
            className="self-start"
          >
            ▶ Drill this
          </Button>
          {t.drill.note && (
            <p className="text-xs text-text-dim">{t.drill.note}</p>
          )}
        </div>
      )}

      {t.related && t.related.length > 0 && (
        <div className="text-sm text-text-dim">
          Related:{' '}
          {t.related.map((id, i) => {
            const rt = getTechniqueById(id);
            return rt ? (
              <span key={id}>
                {i > 0 && ' · '}
                <Link to={`/learn/${rt.slug}`} className="text-accent hover:underline">
                  {rt.id} {rt.title}
                </Link>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

export function LearnDetailPage() {
  const { slug } = useParams();
  const technique = getTechnique(slug);
  const reference = getReference(slug);
  const strategy = getStrategy(slug);

  if (technique) return <TechniqueView t={technique} />;

  if (reference) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <div className="font-mono text-xs text-text-dim">{reference.id}</div>
          <h1 className="mt-1 font-mono text-2xl font-semibold text-text">
            {reference.title}
          </h1>
          <p className="mt-2 text-text-dim">{reference.intro}</p>
        </div>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-dim">
                {reference.columns.map((c) => (
                  <th key={c} className="py-2 pr-6 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {reference.rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  {row.map((cell, j) => (
                    <td key={j} className="py-1.5 pr-6 text-text">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Button
          variant="secondary"
          disabled
          title="Flashcard decks arrive with the SRS milestone (M5)."
          className="self-start"
        >
          Turn into flashcards →
        </Button>
      </div>
    );
  }

  if (strategy) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div>
          <div className="font-mono text-xs text-text-dim">{strategy.id}</div>
          <h1 className="mt-1 font-mono text-2xl font-semibold text-text">
            {strategy.title}
          </h1>
        </div>
        <Card>
          <p className="text-sm leading-relaxed text-text">{strategy.body}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-16 text-center text-text-dim">
      Not found.{' '}
      <Link to="/learn" className="text-accent underline">
        Back to Learn
      </Link>
    </div>
  );
}

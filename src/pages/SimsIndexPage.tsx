import { Link } from 'react-router-dom';
import { Card } from '@/ui/primitives';
import { SIMS } from '@/content/sims';

export function SimsIndexPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-mono text-2xl font-semibold text-text">Firm simulators</h1>
        <p className="mt-1 text-sm text-text-dim">
          Rehearse the real test&apos;s rules, pressure and scoring — fixed count,
          Enter to submit, negative marking, no mid-test feedback. Pass bars are
          community-reported estimates, not official firm data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SIMS.map((sim) => (
          <Link key={sim.id} to={`/sims/${sim.id}`} className="block">
            <Card className="h-full transition-colors hover:border-accent hover:bg-surface-2">
              <div className="font-mono text-lg font-semibold text-text">
                {sim.name}
              </div>
              <p className="mt-1 text-sm text-text-dim">{sim.blurb}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

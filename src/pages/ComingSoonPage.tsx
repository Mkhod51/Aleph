import { Link } from 'react-router-dom';

/** Honest placeholder for routes whose screens land in a later milestone. */
export function ComingSoonPage({
  title,
  milestone,
}: {
  title: string;
  milestone: string;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-16 text-center">
      <h1 className="font-mono text-2xl font-semibold text-text">{title}</h1>
      <p className="text-sm text-text-dim">
        This screen ships in milestone {milestone}. The engine and data model are
        already in place underneath it.
      </p>
      <Link
        to="/"
        className="rounded-btn border border-border px-4 py-2 text-sm text-text-dim transition-colors hover:border-accent hover:text-text"
      >
        ← Back to Home
      </Link>
    </div>
  );
}

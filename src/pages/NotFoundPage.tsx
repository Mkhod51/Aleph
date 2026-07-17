import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-16 text-center">
      <h1 className="font-mono text-4xl font-semibold text-text">404</h1>
      <p className="text-sm text-text-dim">That route doesn&apos;t exist.</p>
      <Link
        to="/"
        className="rounded-btn border border-border px-4 py-2 text-sm text-text-dim transition-colors hover:border-accent hover:text-text"
      >
        ← Back to Home
      </Link>
    </div>
  );
}

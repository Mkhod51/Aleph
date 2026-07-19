import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** A neutral surface card (doc 07 §2: 8px radius, 1px border, no shadow in dark). */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border border-border bg-surface p-4 ${className}`}
    >
      {children}
    </div>
  );
}

/** A small caption/eyebrow label. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-[0.8125rem] font-medium uppercase tracking-wide text-text-dim">
      {children}
    </div>
  );
}

/** A card that navigates on click — used for the Home shortcuts row. */
export function NavCard({
  to,
  title,
  hint,
}: {
  to: string;
  title: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-card border border-border bg-surface p-4 transition-colors duration-fast ease-out-t hover:border-accent hover:bg-surface-2"
    >
      <div className="font-mono text-sm font-semibold text-text">{title}</div>
      <div className="mt-1 text-[0.8125rem] text-text-dim">{hint}</div>
    </Link>
  );
}

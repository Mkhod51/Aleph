import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * A neutral surface card — the `.panel` recipe from ui-redesign/01 §2 (1px
 * hairline + top inner-highlight + surface sheen, 10px radius). Opt-in props:
 *   hover → `.panel-hover` lift on hover (H1)
 *   grid  → `.gridfield` graph-paper texture (heroes / empty states only)
 */
export function Card({
  children,
  className = '',
  hover = false,
  grid = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  grid?: boolean;
}) {
  return (
    <div
      className={[
        'panel p-4',
        hover && 'panel-hover',
        grid && 'gridfield',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

/** A small caption/eyebrow label (ui-redesign/01 §4: --text-faint, 0.06em). */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-[0.8125rem] font-medium uppercase tracking-[0.06em] text-text-faint">
      {children}
    </div>
  );
}

/**
 * A card that navigates on click — used for the Home shortcuts row. Reuses
 * `.panel-hover` (lift) and adds a hover arrow shift (ui-redesign/02 §A).
 */
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
      className="panel panel-hover group flex items-start justify-between gap-3 p-4"
    >
      <span className="min-w-0">
        <span className="block font-mono text-sm font-semibold text-text">
          {title}
        </span>
        <span className="mt-1 block text-[0.8125rem] text-text-dim">{hint}</span>
      </span>
      <span
        aria-hidden
        className="mt-0.5 shrink-0 text-text-faint transition-[transform,color] duration-fast ease-spring-t group-hover:translate-x-0.5 group-hover:text-accent"
      >
        →
      </span>
    </Link>
  );
}

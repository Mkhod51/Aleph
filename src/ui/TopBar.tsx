import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { APP_MARK, APP_NAME } from '@/lib/brand';
import { Chip, FlameIcon, BoltIcon } from '@/ui/kit';
import { useStreakStore } from '@/store/streak';
import { dueCount } from '@/store/srs';

const NAV = [
  { to: '/play', label: 'Play' },
  { to: '/sims', label: 'Sims' },
  { to: '/drills', label: 'Drills' },
  { to: '/learn', label: 'Learn' },
  { to: '/stats', label: 'Stats' },
];

function linkClass({ isActive }: { isActive: boolean }): string {
  return [
    'relative rounded-btn px-2 py-1 text-sm transition-colors duration-fast ease-out-t',
    isActive ? 'text-accent' : 'text-text-dim hover:text-text',
  ].join(' ');
}

/** Thin top bar (doc 07 §3). Hidden during play in a later milestone. */
export function TopBar() {
  const location = useLocation();
  const streakCurrent = useStreakStore((s) => s.current);
  const [due, setDue] = useState(0);

  // Habit chips (C3): re-read the tiny srsCards table on every route change;
  // the streak store is already reactive.
  useEffect(() => {
    let alive = true;
    dueCount().then((n) => alive && setDue(n));
    return () => {
      alive = false;
    };
  }, [location.pathname]);

  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex h-12 w-full max-w-content items-center gap-1 px-4 sm:px-6">
        <NavLink
          to="/"
          className="mr-2 flex items-center gap-2 font-mono text-sm font-semibold text-text"
        >
          <span className="text-accent" aria-hidden>
            {APP_MARK}
          </span>
          <span>{APP_NAME}</span>
        </NavLink>

        <div className="flex items-center gap-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {({ isActive }) => (
                <>
                  {item.label}
                  {/* Selected marker (N1): a 2px accent underline, not just a
                      color change (ui-redesign/01 §6). Per-item, cheap, no JS. */}
                  {isActive && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          {streakCurrent > 0 && (
            <Link
              to="/daily"
              title="Daily streak"
              className="rounded-full transition-opacity duration-fast ease-out-t hover:opacity-80"
            >
              <Chip tone="neutral">
                <FlameIcon value={streakCurrent} className="text-accent" />
                {streakCurrent}
              </Chip>
            </Link>
          )}
          {due > 0 && (
            <Link
              to="/srs"
              title="Flashcards due"
              className="rounded-full transition-opacity duration-fast ease-out-t hover:opacity-80"
            >
              <Chip tone="accent">
                <BoltIcon value={due} className="text-accent" />
                {due} due
              </Chip>
            </Link>
          )}
          <NavLink
            to="/settings"
            className={linkClass}
            aria-label="Settings"
            title="Settings"
          >
            <span aria-hidden className="text-xl leading-none">⚙</span>
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

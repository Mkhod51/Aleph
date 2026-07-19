import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { APP_MARK, APP_NAME } from '@/lib/brand';
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
    'rounded-btn px-2 py-1 text-sm transition-colors duration-fast ease-out-t',
    isActive ? 'text-accent' : 'text-text-dim hover:text-text',
  ].join(' ');
}

const CHIP =
  'rounded-btn px-2 py-1 font-mono text-sm text-text-dim transition-colors duration-fast ease-out-t hover:text-text';

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
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          {streakCurrent > 0 && (
            <Link to="/daily" className={CHIP} title="Daily streak">
              🔥 {streakCurrent}
            </Link>
          )}
          {due > 0 && (
            <Link to="/srs" className={CHIP} title="Flashcards due">
              ⚡ {due} due
            </Link>
          )}
          <NavLink
            to="/settings"
            className={linkClass}
            aria-label="Settings"
            title="Settings"
          >
            <span aria-hidden>⚙</span>
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

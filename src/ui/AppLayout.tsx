import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { useSettingsStore } from '@/store/useSettingsStore';
import { applyTheme, watchSystemTheme } from '@/store/theme';
import { useStreakStore } from '@/store/streak';
import { todayKey } from '@/store/daily';

/**
 * Root layout: keeps the resolved theme in sync with the setting (and the OS
 * preference while in "system" mode), then renders the top bar + routed page.
 *
 * Container-width convention (ui-review 03 §C4): each page sets its own inner
 * max-width by content type, within this shell's `max-w-content` outer bound:
 *   narrow  `max-w-2xl`     : settings, daily, srs
 *   default `max-w-3xl`     : home, learn, drills, sims, results
 *   wide    `max-w-content` : stats (dense dashboard)
 */
export function AppLayout() {
  const theme = useSettingsStore((s) => s.theme);
  const location = useLocation();
  // The top bar is hidden during play, the question is the whole interface
  // (doc 07 §1/§3). Covers sprint play and sim play (/sims/:id/play).
  const isPlay =
    location.pathname.startsWith('/play') ||
    location.pathname === '/drills/play' ||
    location.pathname === '/daily/play' ||
    location.pathname === '/srs' ||
    /^\/sims\/[^/]+\/play$/.test(location.pathname);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return;
    return watchSystemTheme(() => applyTheme('system'));
  }, [theme]);

  // Streak transitions run on app open (no background timers, doc 05 §6).
  useEffect(() => {
    useStreakStore.getState().reconcile(todayKey());
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-text">
      {!isPlay && <TopBar />}
      {isPlay ? (
        <main className="flex-1">
          <Outlet />
        </main>
      ) : (
        <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      )}
    </div>
  );
}

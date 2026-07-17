import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { useSettingsStore } from '@/store/useSettingsStore';
import { applyTheme, watchSystemTheme } from '@/store/theme';

/**
 * Root layout: keeps the resolved theme in sync with the setting (and the OS
 * preference while in "system" mode), then renders the top bar + routed page.
 */
export function AppLayout() {
  const theme = useSettingsStore((s) => s.theme);
  const location = useLocation();
  // The top bar is hidden during play — the question is the whole interface
  // (doc 07 §1/§3). Covers sprint play and sim play (/sims/:id/play).
  const isPlay =
    location.pathname.startsWith('/play') ||
    location.pathname === '/drills/play' ||
    /^\/sims\/[^/]+\/play$/.test(location.pathname);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return;
    return watchSystemTheme(() => applyTheme('system'));
  }, [theme]);

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

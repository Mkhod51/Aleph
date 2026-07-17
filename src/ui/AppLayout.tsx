import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { useSettingsStore } from '@/store/useSettingsStore';
import { applyTheme, watchSystemTheme } from '@/store/theme';

/**
 * Root layout: keeps the resolved theme in sync with the setting (and the OS
 * preference while in "system" mode), then renders the top bar + routed page.
 */
export function AppLayout() {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return;
    return watchSystemTheme(() => applyTheme('system'));
  }, [theme]);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-text">
      <TopBar />
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

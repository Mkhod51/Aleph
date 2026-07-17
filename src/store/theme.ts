export type ThemeSetting = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

const LIGHT_QUERY = '(prefers-color-scheme: light)';

/** Resolve a theme setting to a concrete theme, honoring the OS preference. */
export function resolveTheme(setting: ThemeSetting): ResolvedTheme {
  if (setting === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark';
    }
    return 'dark';
  }
  return setting;
}

/** Stamp the resolved theme onto <html data-theme>. */
export function applyTheme(setting: ThemeSetting): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = resolveTheme(setting);
}

/**
 * While in "system" mode, re-apply when the OS preference flips. Returns an
 * unsubscribe function. No-op outside the browser.
 */
export function watchSystemTheme(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia(LIGHT_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

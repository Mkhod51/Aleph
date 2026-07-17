/* eslint-disable react-refresh/only-export-components -- route config, not an HMR component module */
import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './ui/AppLayout';
import { HomePage } from './pages/HomePage';
import { PlayPage } from './pages/PlayPage';
import { ResultsPage } from './pages/ResultsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ComingSoonPage } from './pages/ComingSoonPage';

// The dashboard (and its Recharts chunk) load only when /stats is visited.
const StatsPage = lazy(() =>
  import('./pages/StatsPage').then((m) => ({ default: m.StatsPage })),
);

function LazyStats() {
  return (
    <Suspense fallback={<p className="py-16 text-center text-text-dim">Loading…</p>}>
      <StatsPage />
    </Suspense>
  );
}

/**
 * Route table — doc 07 §3. M0 ships Home + Settings as real pages; the remaining
 * routes are honest "coming in milestone N" placeholders so the shell is complete
 * and later milestones drop their screens straight in.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'play', element: <PlayPage /> },
      { path: 'play/:preset', element: <PlayPage /> },
      { path: 'sims', element: <ComingSoonPage title="Sims" milestone="M3" /> },
      {
        path: 'sims/:id',
        element: <ComingSoonPage title="Sim lobby" milestone="M3" />,
      },
      { path: 'drills', element: <ComingSoonPage title="Drills" milestone="M4" /> },
      { path: 'learn', element: <ComingSoonPage title="Learn" milestone="M4" /> },
      {
        path: 'learn/:slug',
        element: <ComingSoonPage title="Technique" milestone="M4" />,
      },
      { path: 'stats', element: <LazyStats /> },
      {
        path: 'daily',
        element: <ComingSoonPage title="Daily challenge" milestone="M5" />,
      },
      { path: 'srs', element: <ComingSoonPage title="Flashcards" milestone="M5" /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'results/:sessionId', element: <ResultsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

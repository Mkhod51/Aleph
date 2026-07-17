/* eslint-disable react-refresh/only-export-components -- route config, not an HMR component module */
import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './ui/AppLayout';
import { HomePage } from './pages/HomePage';
import { PlayPage } from './pages/PlayPage';
import { ResultsPage } from './pages/ResultsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SimsIndexPage } from './pages/SimsIndexPage';
import { SimLobbyPage } from './pages/SimLobbyPage';
import { SimPlayPage } from './pages/SimPlayPage';
import { LearnPage } from './pages/LearnPage';
import { LearnDetailPage } from './pages/LearnDetailPage';
import { DrillsPage } from './pages/DrillsPage';
import { DrillPlayPage } from './pages/DrillPlayPage';
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
      { path: 'sims', element: <SimsIndexPage /> },
      { path: 'sims/:id', element: <SimLobbyPage /> },
      { path: 'sims/:id/play', element: <SimPlayPage /> },
      { path: 'drills', element: <DrillsPage /> },
      { path: 'drills/play', element: <DrillPlayPage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'learn/:slug', element: <LearnDetailPage /> },
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

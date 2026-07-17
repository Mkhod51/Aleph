import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';

// Dev-only console helper to populate the dashboard with synthetic history.
// Tree-shaken out of production builds. Usage: await __seedAleph({ sessions: 40 }).
if (import.meta.env.DEV) {
  void import('./store/seedFixture').then(({ seedSynthetic }) => {
    (window as unknown as { __seedAleph: typeof seedSynthetic }).__seedAleph =
      seedSynthetic;
  });
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

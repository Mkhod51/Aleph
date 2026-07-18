import { test, expect, type Page } from '@playwright/test';

/**
 * Smoke flow 1 (doc 08 §6): load → start a short sprint → answer correctly →
 * the clock ends → results shows a score and a review table.
 *
 * A short custom preset and countdown-off are seeded via localStorage so the run
 * completes quickly and deterministically without driving the preset editor.
 */
const PRESETS = {
  state: {
    custom: [
      {
        id: 'e2e',
        name: 'E2E',
        builtin: false,
        durationMs: 8000,
        ops: { add: true, sub: true, mul: true, div: true },
        addRange: { min: 2, max: 100 },
        mulRange: { aMin: 2, aMax: 12, bMin: 2, bMax: 100 },
        extended: false,
      },
    ],
    selectedId: 'e2e',
  },
  version: 1,
};

const SETTINGS = {
  state: {
    theme: 'dark',
    countdown: false,
    countdownSkip: false,
    clockVisible: true,
    scoreVisible: true,
    sound: false,
    questionFontSize: 'L',
    leftHandedKeypad: false,
    onboarded: true,
  },
  version: 1,
};

/** Compute the answer to a prompt like "47 × 36" / "528 ÷ 6" / "86 − 44". */
function solve(prompt: string): string | null {
  const parts = prompt.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const [a, op, b] = parts;
  const x = Number(a);
  const y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  switch (op) {
    case '+':
      return String(x + y);
    case '−':
      return String(x - y);
    case '×':
      return String(x * y);
    case '÷':
      return String(x / y);
    default:
      return null;
  }
}

async function answerUntilResults(page: Page) {
  const input = page.getByRole('textbox', { name: 'Your answer' });
  const prompt = page.locator('[aria-live="polite"]');
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    if (page.url().includes('/results/')) return;
    let text: string | null = null;
    try {
      text = (await prompt.first().innerText({ timeout: 500 })).trim();
    } catch {
      continue; // prompt gone → session likely ending
    }
    const answer = solve(text);
    if (!answer) {
      await page.waitForTimeout(30);
      continue;
    }
    try {
      await input.fill(answer, { timeout: 500 });
    } catch {
      return; // input gone → results
    }
    await page.waitForTimeout(20);
  }
}

test('sprint end-to-end: play, finish, see results', async ({ page }) => {
  await page.addInitScript(
    ([presets, settings]) => {
      localStorage.setItem('aleph-presets', presets);
      localStorage.setItem('aleph-settings', settings);
    },
    [JSON.stringify(PRESETS), JSON.stringify(SETTINGS)] as [string, string],
  );

  await page.goto('/');
  const start = page.getByRole('button', { name: /START SPRINT/ });
  await expect(start).toBeVisible();
  await start.click();

  await expect(page.getByRole('textbox', { name: 'Your answer' })).toBeVisible();
  await answerUntilResults(page);

  // The clock ends the sprint and routes to results.
  await page.waitForURL('**/results/**', { timeout: 15_000 });

  // Score is shown and the review table has rows.
  await expect(page.getByText('correct', { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  const rows = page.locator('table tbody tr');
  expect(await rows.count()).toBeGreaterThan(0);
});

import { test, expect, type Page } from '@playwright/test';

/**
 * Smoke flow 2 (doc 08 §6): a fixture sim with a known seed and scripted answers
 * produces the hand-computed net score. Uses the URL overrides to make a short,
 * deterministic, integer-only run (6 questions): 4 correct + 2 wrong → net 2.
 */
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
  },
  version: 1,
};

function solve(prompt: string): string | null {
  const parts = prompt.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const [a, op, b] = parts;
  const x = Number(a);
  const y = Number(b);
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

async function answer(page: Page, correctCount: number, total: number) {
  const input = page.getByRole('textbox', { name: 'Your answer' });
  const prompt = page.locator('[aria-live="polite"]');
  for (let i = 0; i < total; i++) {
    const text = (await prompt.first().innerText()).trim();
    const correct = solve(text);
    // Wrong answers get a digit appended so they never match.
    const give = i < correctCount ? (correct ?? '0') : `${correct ?? '0'}9`;
    await input.fill(give);
    await input.press('Enter');
    await page.waitForTimeout(20);
  }
}

test('sim: no-skip test input, scripted answers → hand-computed net', async ({ page }) => {
  await page.addInitScript((settings) => {
    localStorage.setItem('aleph-settings', settings);
  }, JSON.stringify(SETTINGS));

  await page.goto('/sims/optiver80/play?count=6&seconds=120&seed=123&profile=zetamac');

  const input = page.getByRole('textbox', { name: 'Your answer' });
  await expect(input).toBeVisible();

  // No-skip: Enter on an empty field must not advance.
  await expect(page.getByText('Q 1/6')).toBeVisible();
  await input.press('Enter');
  await expect(page.getByText('Q 1/6')).toBeVisible();

  await answer(page, 4, 6);

  await page.waitForURL('**/results/**', { timeout: 15_000 });

  // 4 correct − 2 wrong = net 2.
  await expect(page.locator('.text-hero')).toHaveText('2');
  expect(await page.locator('[aria-label="correct"]').count()).toBe(4);
  expect(await page.locator('[aria-label="wrong"]').count()).toBe(2);
});

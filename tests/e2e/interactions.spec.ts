// INTERACTION_ACCEPTANCE.md, one test per row where it can be automated.
import { expect, test, type Page } from '@playwright/test';

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 768;
const toInstrument = async (page: Page, sel: string) => {
  const fig = page.locator(sel);
  await fig.scrollIntoViewIfNeeded();
  await expect(fig).toHaveAttribute('data-ready', '');
  return fig;
};

test.describe('I-1 evidence stamp', () => {
  test('1.1–1.3 full labels; popover opens and closes', async ({ page }) => {
    await page.goto('/work/pressure-vit/');
    const stamp = page.locator('#results button.stamp, section[aria-labelledby="results"] button.stamp').first();
    await expect(stamp).toHaveText('PUBLIC DATA');
    await stamp.scrollIntoViewIfNeeded();
    await stamp.click();
    await expect(stamp).toHaveAttribute('aria-expanded', 'true');
    const pop = page.locator(`#${await stamp.getAttribute('aria-controls')}`);
    await expect(pop).toBeVisible();
    await expect(pop).toContainText('Leave-one-subject-out');
    await expect(pop).toContainText('Source');
    await page.keyboard.press('Escape');
    await expect(pop).toBeHidden();
    await expect(stamp).toBeFocused();
  });

  test('1.4 popover stays within the viewport', async ({ page }) => {
    await page.goto('/work/quality-tooling/');
    for (const stamp of await page.locator('section[aria-labelledby="results"] button.stamp').all()) {
      await stamp.scrollIntoViewIfNeeded();
      await stamp.click();
      const pop = page.locator(`#${await stamp.getAttribute('aria-controls')}`);
      const box = (await pop.boundingBox())!;
      const vw = page.viewportSize()!.width;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 1);
      await page.keyboard.press('Escape');
    }
  });
});

test.describe('I-2 lens filter', () => {
  test('2.1–2.3 filter, live region, hash', async ({ page }) => {
    await page.goto('/work/');
    const rows = page.locator('li[data-lenses]');
    await expect(rows).toHaveCount(9);
    await expect(page.locator('[data-lens="all"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-lens="product"]').click();
    await expect(page).toHaveURL(/#product$/);
    const visible = await rows.evaluateAll((els) => els.filter((e) => !(e as HTMLElement).hidden && e.getClientRects().length).length);
    const expected = await rows.evaluateAll((els) => els.filter((e) => (e as HTMLElement).dataset.lenses!.split(' ').includes('product')).length);
    expect(visible).toBe(expected);
    await expect(page.locator('[aria-live]').filter({ hasText: 'Showing' }).first()).toHaveText(`Showing ${expected} projects`);
    await page.goto('/work/#research');
    await expect(page.locator('[data-lens="research"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('2.6 all-work link is computed', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'All work (9) →' })).toBeVisible();
  });
});

test.describe('I-3 leakage toggle', () => {
  test('3.1–3.4 default, toggle, honest marker, announcement', async ({ page }) => {
    await page.goto('/work/pressure-vit/');
    const fig = await toInstrument(page, '[data-instrument="leakage"]');
    await expect(fig.locator('[data-value]')).toHaveText('90.7%');
    await expect(fig.locator('[data-ci]')).toContainText('87.2–94.0');
    await expect(fig.locator('[data-delta]')).toBeHidden();
    await expect(fig.getByText('honest result')).toBeVisible();
    await fig.getByRole('button', { name: 'Random frames' }).click();
    await expect(fig.locator('[data-value]')).toHaveText('98.3%');
    await expect(fig.locator('[data-delta]')).toHaveText('+7.6 pts inflated');
    await expect(fig.getByRole('button', { name: 'Random frames' })).toHaveAttribute('aria-pressed', 'true');
    await expect(fig.locator('[data-live]')).toHaveText(
      'Random frames: 98.3 percent accuracy, 7.6 points higher than unseen people',
    );
    await expect(fig.getByText('honest result')).toBeVisible();
  });
});

test.describe('I-4 mutation strip', () => {
  test('4.1–4.5 counts, toggle, tooltip, roving focus', async ({ page }) => {
    await page.goto('/work/quality-tooling/');
    const fig = await toInstrument(page, '[data-instrument="mutation"]');
    const cells = fig.locator('[data-cell]');
    await expect(cells).toHaveCount(90);
    await expect(fig.locator('.mut__cell.is-killed[data-cell]')).toHaveCount(7);
    await expect(fig.locator('[data-readout]')).toHaveText('7 / 90 killed · 7.8%');
    await expect(fig).toContainText('Planted bugs caught: 0 / 12 → 10 / 12');
    await fig.getByRole('button', { name: 'After generated tests' }).click();
    await expect(fig.locator('.mut__cell.is-killed[data-cell]')).toHaveCount(79);
    await expect(fig.locator('[data-readout]')).toHaveText('79 / 90 killed · 87.8%');
    await cells.first().focus();
    await expect(fig.locator('[data-tip]')).toBeVisible();
    await expect(fig.locator('[data-tip]')).toContainText('inventory/orders.py:8');
    await page.keyboard.press('ArrowRight');
    await expect(cells.nth(1)).toBeFocused();
    expect(await fig.locator('[data-cell][tabindex="0"]').count()).toBe(1);
  });
});

test.describe('I-5 agent trace', () => {
  test('5.1–5.7 featured day, navigation, empty states', async ({ page }) => {
    await page.goto('/work/growth-agents/');
    const fig = await toInstrument(page, '[data-instrument="trace"]');
    await expect(fig.locator('[data-trace-label]')).toHaveText('Day 7 of 30');
    const names = await fig.locator('.tr-step__name').allTextContents();
    expect(names.map((n) => n.replace(/^\d+\s*/, '').trim().toUpperCase())).toEqual([
      'OBSERVE', 'ESTIMATE', 'PROPOSE', 'GUARDRAILS', 'ALLOCATION', 'APPROVAL',
    ]);
    await expect(fig.locator('.tr-violations li')).toHaveCount(4);
    await expect(fig).toContainText('Ceiling $3,000/day · ±20% per channel per day · ≥5% per channel · >8% shift needs approval');
    await expect(fig.locator('.tr-approval')).toHaveText(
      'Shift 8.55% > 8% · approval needed · approved by simulated reviewer (always approves)',
    );
    await expect(fig).toContainText('spent today');
    await expect(fig).toContainText('planned for tomorrow');
    await expect(fig).toContainText('Simulated players and channels. No real ad spend.');
    await fig.locator('[data-trace-select]').selectOption('1');
    await expect(fig).toContainText('No matured cohorts yet (cohorts mature after 3 days)');
    await expect(fig.locator('[data-trace-prev]')).toBeDisabled();
    await expect(fig.locator('[data-live]')).toHaveText('Day 1: no guardrail violations, approval not required');
    await fig.locator('[data-trace-select]').selectOption('30');
    await expect(fig.locator('[data-trace-next]')).toBeDisabled();
    await fig.locator('[data-trace-select]').selectOption('16');
    await expect(fig.locator('.tr-empty').filter({ hasText: 'No violations' })).toBeVisible();
    await expect(fig.locator('.tr-approval')).toContainText('approval not required');
    await fig.locator('[data-trace-prev]').click();
    await expect(fig.locator('[data-trace-label]')).toHaveText('Day 15 of 30');
  });
});

test.describe('I-6 section rail', () => {
  test('6.1–6.4 rail lists the sections and jumps', async ({ page }) => {
    await page.goto('/work/pressure-vit/');
    const h2 = await page.locator('.case__h2').allTextContents();
    if (isMobile(page)) {
      const opts = await page.locator('[data-rail-select] option').allTextContents();
      expect(opts).toHaveLength(h2.length);
      await page.locator('[data-rail-select]').selectOption('results');
    } else {
      const links = page.locator('[data-rail-link]');
      await expect(links).toHaveCount(h2.length);
      await expect(links.nth(0)).toHaveText('§1 Question');
      await page.locator('[data-rail-link="results"]').click();
      await expect(page.locator('[data-rail-link="results"]')).toHaveAttribute('aria-current', 'true');
    }
    await expect(page.locator('#results')).toBeFocused();
    await expect(page).toHaveURL(/#results$/);
  });
});

test.describe('I-7 contents sheet', () => {
  test('7.1–7.3 opens, traps, closes', async ({ page }) => {
    test.skip(!isMobile(page), 'mobile only');
    await page.goto('/');
    const btn = page.getByRole('button', { name: 'Contents' });
    await btn.click();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('link', { name: /Email/ })).toHaveAttribute('href', /^mailto:/);
    await expect(sheet).toContainText('CV [placeholder]');
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(btn).toBeFocused();
  });
});

test.describe('I-8 contact', () => {
  test('8.3 copy puts the address on the clipboard and announces it', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only in Playwright');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    const block = page.locator('#contact');
    const email = (await block.locator('a[href^="mailto:"]').first().getAttribute('href'))!.replace('mailto:', '');
    const btn = block.locator('button[data-copy]');
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await expect(btn).toHaveText(/copied/i);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(email);
    await expect(block.locator('[data-copy-status]')).not.toBeEmpty();
    await expect(block).toContainText('CV [placeholder]');
  });
});

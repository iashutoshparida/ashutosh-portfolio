import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = [
  '/', '/work/', '/work/quality-tooling/', '/work/growth-agents/', '/work/pressure-vit/', '/work/digital-mirror/',
  '/work/credit-risk/', '/work/hsic-wallet-share/', '/work/dark-store/', '/work/nobroker/', '/work/sha3-accelerator/',
  '/lab/', '/lab/vqe/', '/lab/viscous-fingering/', '/about/', '/colophon/', '/404/',
];

for (const route of ROUTES) {
  test(`axe: no serious or critical violations on ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(route);
    // Let lazy instruments mount so they are audited too.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    const res = await new AxeBuilder({ page }).analyze();
    const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
    expect(errors.filter((e) => !/404/.test(e) || route !== '/404/')).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, 'horizontal scroll').toBeLessThanOrEqual(0);
  });
}

test.describe('no JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('instruments show their static fallbacks', async ({ page }) => {
    await page.goto('/work/pressure-vit/');
    await expect(page.locator('[data-instrument="leakage"] [data-value]')).toHaveText('90.7%');
    await expect(page.locator('[data-instrument="leakage"] table')).toContainText('98.3%');
    await page.goto('/work/quality-tooling/');
    await expect(page.locator('[data-instrument="mutation"] table').first()).toContainText('79 / 90 killed');
    await page.goto('/work/growth-agents/');
    await expect(page.locator('.tr-violations li')).toHaveCount(4);
    await page.goto('/work/');
    await expect(page.locator('li[data-lenses]')).toHaveCount(9);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no transitions run', async ({ page }) => {
    await page.goto('/work/pressure-vit/');
    const dur = await page.locator('.leak__fill').evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(dur.split(',').every((d) => parseFloat(d) === 0)).toBe(true);
  });
});

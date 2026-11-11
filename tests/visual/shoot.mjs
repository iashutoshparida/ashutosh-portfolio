// Usage: node tests/visual/shoot.mjs <baseUrl> <outDir> <path...>
import { chromium } from '@playwright/test';
const [base, out, ...paths] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 768, hasTouch: w < 768 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const name = `${out}/${(p.replace(/\//g, '_') || '_') }-${w}.png`;
    await page.screenshot({ path: name, fullPage: true });
    console.log(name, errors.length ? 'ERRORS: ' + errors.join(' | ') : 'ok');
    errors.length = 0;
  }
  await ctx.close();
}
await browser.close();

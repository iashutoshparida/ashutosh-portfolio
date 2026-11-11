import { defineConfig, devices } from '@playwright/test';

// Locally (no bundled browsers) set CHROME_PATH=/usr/bin/google-chrome. CI uses Playwright's own browsers.
const chrome = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] } : {};
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4321', launchOptions: chrome },
  webServer: { command: 'npx astro preview --port 4321', port: 4321, reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
    ...(process.env.ALL_BROWSERS
      ? [
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
          { name: 'firefox', use: { ...devices['Desktop Firefox'] }, grep: /I-1|I-2|I-7/ },
        ]
      : []),
  ],
});

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/regression/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.APP_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    // Capture screenshot only on failure
    screenshot: 'only-on-failure',
    // Record video only on failure
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  // Run local dev server before starting the tests
  webServer: {
    command: 'npm run start:dev',
    url: 'http://localhost:3000/health',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
}); 
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
  },

  timeout: 60000,

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security', '--allow-running-insecure-content']
        }
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'iPad Pro',
      use: { ...devices['iPad Pro'] },
    },
    {
      name: 'Bloomberg Terminal',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Trading Workstation',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 2560, height: 1440 },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Test matching patterns for enhanced E2E coverage */
  testMatch: [
    '**/*-e2e.test.ts',
    '**/e2e/**/*.test.ts',
    '**/__tests__/**/*-e2e.{ts,js}',
  ],

  /* Include both e2e and __tests__ directories */
  testDir: './',

  /* Test ignore patterns */
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
  ],

  /* Output directory for test artifacts */
  outputDir: 'test-results/',

  /* Enhanced expect configuration */
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      threshold: 0.2,
      animations: 'disabled'
    },
    toMatchSnapshot: {
      threshold: 0.2
    },
  },

  /* Metadata for institutional scenario testing */
  metadata: {
    testType: 'E2E Enhanced Coverage',
    application: 'WREI Trading Platform',
    scenarios: [
      'Infrastructure Fund Discovery',
      'ESG Impact Investment Analysis',
      'DeFi Yield Farming Integration',
      'Family Office Conservative Analysis',
      'Sovereign Wealth Fund Macro Analysis'
    ],
    testEnvironment: process.env.NODE_ENV || 'test',
    buildVersion: process.env.BUILD_VERSION || 'local',
  },

  /* Maximum failures before stopping test suite */
  maxFailures: process.env.CI ? undefined : 5,
});
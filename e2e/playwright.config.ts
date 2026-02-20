import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: 1,
  outputDir: "test-results",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "on",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter coparent-api dev",
      url: "http://localhost:3000/health",
      timeout: 120_000,
      reuseExistingServer: true,
      env: {
        E2E_TEST_MODE: "true",
        PORT: "3000",
        MONGODB_URI: "mongodb://localhost:27017/coparent-e2e",
        LOG_LEVEL: "warn",
        CORS_ORIGIN: "http://localhost:5173",
        APP_URL: "http://localhost:5173",
      },
    },
    {
      command: "pnpm --filter coparent-ui dev",
      url: "http://localhost:5173",
      timeout: 120_000,
      reuseExistingServer: true,
      env: {
        VITE_E2E_TEST_MODE: "true",
        VITE_API_URL: "http://localhost:3000",
      },
    },
  ],
});

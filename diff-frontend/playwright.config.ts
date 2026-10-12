import { defineConfig, devices } from '@playwright/test';

/** End to end tests against the built static site (npm run test:e2e builds and serves it). */
const PORT = 4191;

export default defineConfig({
	testDir: 'tests/e2e',
	testMatch: '**/*.e2e.ts',
	fullyParallel: true,
	workers: 4,
	timeout: 30_000,
	reporter: [['list']],
	use: { baseURL: `http://127.0.0.1:${PORT}`, trace: 'retain-on-failure' },
	webServer: {
		command: `npx vite build && npx vite preview --port ${PORT} --strictPort --host 127.0.0.1`,
		url: `http://127.0.0.1:${PORT}`,
		reuseExistingServer: true,
		timeout: 180_000
	},
	projects: [
		{
			name: 'desktop',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 } },
			testIgnore: '**/mobile.e2e.ts'
		},
		{ name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: '**/mobile.e2e.ts' }
	]
});

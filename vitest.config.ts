import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts'],
		globals: true,
		css: true,
		include: ['tests/**/*.{test,spec}.{js,ts,tsx}'],
		exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'tests/', '**/*.d.ts', '**/*.config.{js,ts}', '**/coverage/**', '.next/'],
		},
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, '.'),
		},
	},
})

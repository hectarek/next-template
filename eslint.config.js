const js = require('@eslint/js')
const globals = require('globals')
const tseslint = require('typescript-eslint')
const pluginReact = require('eslint-plugin-react')
const eslintConfigPrettier = require('eslint-config-prettier')
const { FlatCompat } = require('@eslint/eslintrc')

// FlatCompat setup for Next.js
const compat = new FlatCompat({
	baseDirectory: __dirname,
	resolvePluginsRelativeTo: __dirname,
})

module.exports = [
	// Global ignores
	{
		ignores: ['node_modules/', '.next/', 'public/', '.husky/', 'out/'],
	},

	// Basic JavaScript rules
	js.configs.recommended,

	// Global variables
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},

	// TypeScript rules
	...tseslint.configs.recommended,

	// React rules
	pluginReact.configs.flat.recommended,

	// Next.js Core Configuration
	...compat.config({
		extends: ['next/core-web-vitals', 'next/typescript'],
	}),

	// Prettier Configuration (disables conflicting ESLint formatting rules)
	eslintConfigPrettier,

	// Custom rules
	{
		rules: {
			// Add any custom rule overrides here
		},
	},

	// Allow CommonJS in config files
	{
		files: ['*.config.js', '.lintstagedrc.js'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
]

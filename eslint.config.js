const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const eslintConfigPrettier = require('eslint-config-prettier')
const pluginImport = require('eslint-plugin-import')
const pluginReact = require('eslint-plugin-react')
const pluginTestingLibrary = require('eslint-plugin-testing-library')
const pluginVitest = require('eslint-plugin-vitest')
const globals = require('globals')
const tseslint = require('typescript-eslint')

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

	// TypeScript with type information (for advanced rules)
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: __dirname,
			},
		},
		rules: {
			// TypeScript rules that require type information
			'@typescript-eslint/prefer-optional-chain': 'error', // Use optional chaining
			'@typescript-eslint/prefer-nullish-coalescing': 'error', // Use ?? instead of ||
		},
	},

	// React rules
	pluginReact.configs.flat.recommended,

	// Import plugin configuration
	{
		plugins: {
			import: pluginImport,
		},
	},

	// Next.js Core Configuration
	...compat.config({
		extends: ['next/core-web-vitals', 'next/typescript'],
	}),

	// Prettier Configuration (disables conflicting ESLint formatting rules)
	eslintConfigPrettier,

	// Custom rules
	{
		rules: {
			// === Code Quality & Bug Prevention ===
			'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow warn/error for proper logging
			'no-debugger': 'error', // No debugger statements in production
			'no-unused-vars': 'off', // Let TypeScript handle this
			'no-unreachable': 'error', // Code after return/throw/etc
			'no-duplicate-case': 'error', // Duplicate case labels in switch
			eqeqeq: ['error', 'always'], // Require === and !== instead of == and !=
			'no-implicit-coercion': 'error', // Disallow implicit type conversions
			'no-magic-numbers': [
				'warn',
				{
					ignore: [-1, 0, 1, 2],
					ignoreArrayIndexes: true,
					detectObjects: false,
				},
			], // Warn about magic numbers (except common ones)

			// === Modern JavaScript Best Practices ===
			'prefer-const': 'error', // Use const when variable is never reassigned
			'no-var': 'error', // Use let/const instead of var
			'object-shorthand': 'error', // Use shorthand object syntax
			'prefer-arrow-callback': 'error', // Prefer arrow functions as callbacks
			'prefer-template': 'error', // Use template literals instead of string concatenation
			'no-nested-ternary': 'error', // Disallow nested ternary expressions
			'prefer-destructuring': [
				'error',
				{
					array: false,
					object: true,
				},
			], // Prefer destructuring for objects

			// === TypeScript Specific ===
			'@typescript-eslint/no-explicit-any': 'warn', // Discourage 'any' type
			'@typescript-eslint/no-non-null-assertion': 'warn', // Discourage ! operator
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			], // Allow unused vars starting with _

			// === React Best Practices ===
			'react/prop-types': 'off', // Not needed with TypeScript
			'react/react-in-jsx-scope': 'off', // Not needed in React 17+
			'react/jsx-uses-react': 'off', // Not needed in React 17+
			'react/jsx-no-target-blank': 'error', // Security: require rel="noopener" for target="_blank"
			'react/jsx-key': 'error', // Require key prop in lists
			'react/no-array-index-key': 'warn', // Discourage array index as key
			'react/jsx-boolean-value': ['error', 'never'], // Don't explicitly set true: <Component enabled /> not <Component enabled={true} />

			// === Next.js Specific ===
			'@next/next/no-img-element': 'error', // Use Next.js Image component
			'@next/next/no-html-link-for-pages': 'error', // Use Next.js Link component

			// === Code Organization ===
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
					'newlines-between': 'always',
					alphabetize: { order: 'asc' },
				},
			], // Organize imports
		},
	},

	// Allow CommonJS in config files
	{
		files: ['*.config.js', '.lintstagedrc.js'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
			'no-magic-numbers': 'off', // Config files often have reasonable magic numbers
		},
	},

	// Testing configuration for test files
	{
		files: ['**/*.test.{js,ts,tsx}', '**/*.spec.{js,ts,tsx}', 'tests/**/*'],
		plugins: {
			vitest: pluginVitest,
			'testing-library': pluginTestingLibrary,
		},
		languageOptions: {
			globals: {
				...pluginVitest.environments.env.globals,
			},
		},
		rules: {
			// Vitest rules
			'vitest/expect-expect': 'warn', // Allow tests without assertions (some are demos)
			'vitest/no-commented-out-tests': 'warn',
			'vitest/no-disabled-tests': 'warn',
			'vitest/no-focused-tests': 'error',
			'vitest/prefer-to-be': 'error',
			'vitest/prefer-to-have-length': 'error',
			'vitest/valid-expect': 'error',

			// Testing Library rules (more lenient for demo files)
			'testing-library/await-async-queries': 'warn',
			'testing-library/await-async-utils': 'warn',
			'testing-library/no-await-sync-queries': 'warn',
			'testing-library/no-dom-import': 'error',
			'testing-library/prefer-screen-queries': 'off', // Allow destructuring in demos
			'testing-library/render-result-naming-convention': 'warn',

			// Allow any types in tests for flexibility
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn', // Allow in tests but warn
			// Allow magic numbers in tests (common for assertions)
			'no-magic-numbers': 'off',
			// Allow unused variables in tests (common for destructuring)
			'@typescript-eslint/no-unused-vars': 'warn',
			// Allow constants in expressions (common in test assertions)
			'no-constant-binary-expression': 'off',
		},
	},

	// More lenient rules for example/demo components
	{
		files: ['components/example/**/*', 'tests/components/example/**/*', 'tests/e2e/**/*'],
		rules: {
			// Turn off strict rules for demo files
			'no-nested-ternary': 'warn',
			'testing-library/prefer-screen-queries': 'off',
			'vitest/expect-expect': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'no-constant-binary-expression': 'off',
		},
	},
]

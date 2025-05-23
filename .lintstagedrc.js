const path = require('path')

const buildEslintCommand = filenames =>
	`bunx eslint --fix ${filenames.map(f => path.relative(process.cwd(), f)).join(' ')}`

module.exports = {
	'*.{js,jsx,ts,tsx}': [buildEslintCommand, 'prettier --write'],
	'*.{json,md}': ['prettier --write'],
}

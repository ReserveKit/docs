/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{js,jsx,ts,tsx,md,mdx}',
		'./docs/**/*.{js,jsx,ts,tsx,md,mdx}',
		'./blog/**/*.{js,jsx,ts,tsx,md,mdx}',
	],
	theme: {
		extend: {},
	},
	plugins: [],
	darkMode: ['class', '[data-theme="dark"]'], // Support Docusaurus dark mode
	corePlugins: {
		preflight: false, // Disable Tailwind's reset to avoid conflicts with Docusaurus
	},
	// Allow using @apply in CSS modules
	important: '#tailwind-selector',
}

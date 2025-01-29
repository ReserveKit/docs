import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import type * as Redocusaurus from 'redocusaurus'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
	title: 'ReserveKit Docs',
	tagline: 'Documentation for ReserveKit',
	favicon: 'img/favicon.ico',

	// Set the production url of your site here
	url: 'https://reservekit.io',
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/',

	staticDirectories: ['static'],

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'reservekit', // Usually your GitHub org/user name.
	projectName: 'reservekit', // Usually your repo name.

	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: 'en',
		locales: ['en'],
	},

	presets: [
		[
			'classic',
			{
				docs: {
					sidebarPath: './sidebars.ts',
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					routeBasePath: '/',
					editUrl:
						'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
				},
				blog: false,
			} satisfies Preset.Options,
		],

		[
			'redocusaurus',
			{
				// Plugin Options for loading OpenAPI files
				specs: [
					// You can also pass it a OpenAPI spec URL
					{
						spec: 'openapi/swagger.json',
						route: '/api/',
					},
				],
				// Theme Options for modifying how redoc renders them
				theme: {
					// Change with your site colors
					primaryColor: '#1890ff',
				},
			},
		] satisfies Redocusaurus.PresetEntry,
	],

	themeConfig: {
		// Replace with your project's social card
		image: 'img/docusaurus-social-card.jpg',
		navbar: {
			title: 'ReserveKit Docs',
			logo: {
				alt: 'ReserveKit Logo',
				src: '/img/logo.png',
			},
			items: [
				{
					type: 'docSidebar',
					sidebarId: 'docs',
					position: 'left',
					label: 'Docs',
				},
				{
					href: '/api/',
					sidebarId: 'api',
					position: 'left',
					label: 'API Reference',
				},
				{
					href: 'https://reservekit.io',
					label: 'Website',
					position: 'right',
				},
				{
					href: 'https://github.com/facebook/docusaurus',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
		footer: {
			style: 'dark',
			links: [
				{
					title: 'Docs',
					items: [
						{
							label: 'Introduction',
							to: '/docs',
						},
						{
							label: 'Getting Started',
							to: '/docs/getting-started',
						},
						{
							label: 'Authentication',
							to: '/docs/authentication',
						},
						{
							label: 'API Reference',
							to: '/docs/api',
						},
					],
				},
				{
					title: 'Community',
					items: [
						{
							label: 'Stack Overflow',
							href: 'https://stackoverflow.com/questions/tagged/docusaurus',
						},
						{
							label: 'Discord',
							href: 'https://discordapp.com/invite/docusaurus',
						},
						{
							label: 'X',
							href: 'https://x.com/docusaurus',
						},
					],
				},
				{
					title: 'More',
					items: [
						{
							label: 'GitHub',
							href: 'https://github.com/facebook/docusaurus',
						},
					],
				},
			],
			copyright: `Copyright © ${new Date().getFullYear()} ReserveKit.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
}

export default config

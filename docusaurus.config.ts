import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import type * as Redocusaurus from 'redocusaurus'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
	title: 'ReserveKit Docs',
	tagline:
		'Documentation for ReserveKit - Building blocks for your scheduling system',
	favicon: 'img/favicon.ico',

	// Set the production url of your site here
	url: 'https://docs.reservekit.io',
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
					editUrl: 'https://github.com/qwerqy/reservekit-docs/tree/main',
				},
				blog: false,
				theme: {
					customCss: [
						require.resolve('./src/css/custom.css'),
						require.resolve('./src/css/tailwind.css'),
					],
				},
			} satisfies Preset.Options,
		],

		[
			'redocusaurus',
			{
				config: 'redocly.yaml',
				specs: [
					{
						id: 'api',
						spec: 'https://api.reservekit.io/v1/swagger/doc.json',
						route: '/api/',
					},
				],
				// Theme Options for modifying how redoc renders them
				theme: {
					// Change with your site colors
					primaryColor: 'hsl(24.6 95% 53.1%)',
				},
			},
		] satisfies Redocusaurus.PresetEntry,
	],

	plugins: [
		[
			'vercel-analytics',
			{
				debug: true,
				mode: 'auto',
			},
		],
	],

	themeConfig: {
		metadata: [
			{
				name: 'keywords',
				content:
					'reserveKit, docs, scheduling, bookings, time Slots, services, api, documentation',
			},
		],
		image: 'img/reservekit-og.png',
		navbar: {
			title: 'ReserveKit Docs',
			logo: {
				alt: 'ReserveKit Logo',
				src: '/img/icon-light.png',
				srcDark: '/img/icon-dark.png',
			},
			hideOnScroll: true,
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
					href: 'https://github.com/ReserveKit/docs',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
		footer: {
			links: [
				{
					title: 'Docs',
					items: [
						{
							label: 'Introduction',
							to: '/',
						},
						{
							label: 'Getting Started',
							to: '/',
						},
						{
							label: 'Node.js Library',
							to: '/libraries/nodejs',
						},
						{
							label: 'Go Library',
							to: '/libraries/go',
						},
						{
							label: 'NextJS Quickstart',
							to: '/quick-start/next-js',
						},
						{
							label: 'Express Quickstart',
							to: '/quick-start/express',
						},
						{
							label: 'API Reference',
							to: '/api/',
						},
					],
				},
				{
					title: 'Community',
					items: [
						{
							label: 'Discord',
							href: 'https://community.reservekit.io',
						},
						{
							label: 'X',
							href: 'https://x.com/reservekitio',
						},
					],
				},
				{
					title: 'More',
					items: [
						{
							label: 'GitHub',
							href: 'https://github.com/ReserveKit/docs',
						},
						{
							label: 'Website',
							href: 'https://reservekit.io',
						},
						{
							label: 'Dashboard',
							href: 'https://app.reservekit.io',
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

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Warm saffron orange - from logo thread (primary brand color)
				brand: {
					50: '#fef9f3',
					100: '#fdf0e1',
					200: '#fbdfc3',
					300: '#f7c899',
					400: '#f2ab65',
					500: '#e8923e',
					600: '#d47f2a',
					700: '#b86a1f',
					800: '#94551f',
					900: '#78471d',
					950: '#41220c'
				},
				// Warm ivory background - luxurious, soft
				ivory: {
					50: '#fffdf9',
					100: '#fdf8f0',
					200: '#f7efe3',
					300: '#f0e4d3',
					400: '#e6d5bd'
				},
				// Rich charcoal-brown - from logo text (sophisticated)
				charcoal: {
					50: '#f8f7f6',
					100: '#eceae7',
					200: '#d9d5d0',
					300: '#c0b9b1',
					400: '#a49a8f',
					500: '#8d8175',
					600: '#776b60',
					700: '#5e544a',
					800: '#3d3530',
					900: '#2a2420',
					950: '#1a1714'
				},
				// Champagne gold accent - haute-couture touch
				gold: {
					300: '#ddc687',
					400: '#c9a962',
					500: '#b8954a',
					600: '#a07b3a',
					700: '#836131'
				}
			},
			fontFamily: {
				sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				serif: ['Cormorant Garamond', 'ui-serif', 'Georgia', 'serif']
			},
			letterSpacing: {
				'extra-wide': '0.15em'
			},
			lineHeight: {
				'relaxed': '1.75',
				'loose': '2'
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography')
	]
};

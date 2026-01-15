/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Warm rose/blush brand palette - elegant and crafty
				brand: {
					50: '#fdf8f6',
					100: '#f9eeea',
					200: '#f3ddd5',
					300: '#e9c4b8',
					400: '#dba391',
					500: '#cb7f68',
					600: '#b86b55',
					700: '#9a5745',
					800: '#7f4a3c',
					900: '#6a4035',
					950: '#391f1a'
				},
				// Warm cream background
				cream: {
					50: '#fefdfb',
					100: '#fdf9f3',
					200: '#faf3e8',
					300: '#f5ead8',
					400: '#eedcc3'
				},
				// Warm charcoal for text
				charcoal: {
					50: '#f7f6f5',
					100: '#e8e6e3',
					200: '#d4d0cb',
					300: '#b5aea6',
					400: '#968c82',
					500: '#7a6f64',
					600: '#655b52',
					700: '#534b44',
					800: '#47413b',
					900: '#3d3834',
					950: '#292521'
				}
			},
			fontFamily: {
				sans: ['Source Sans 3', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				serif: ['Lora', 'ui-serif', 'Georgia', 'serif']
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

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				brand: {
					50: '#fdf4ff',
					100: '#fae8ff',
					200: '#f5d0fe',
					300: '#f0abfc',
					400: '#e879f9',
					500: '#d946ef',
					600: '#c026d3',
					700: '#a21caf',
					800: '#86198f',
					900: '#701a75',
					950: '#4a044e'
				}
			},
			fontFamily: {
				sans: ['Source Sans 3', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				serif: ['Lora', 'ui-serif', 'Georgia', 'serif']
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography')
	]
};

const colors = require('tailwindcss/colors')

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				dark: '#F0F0FE',
				gray: '#E2E2FD',
				light: "#222222",
				primary: {
					default: '#6366F1',
					light: '#ACA5FF',
					dark: '#ACA5FF'
				}
			}
		}
	},

	plugins: []
};

module.exports = config;

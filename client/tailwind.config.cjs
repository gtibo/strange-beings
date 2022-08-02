const colors = require('tailwindcss/colors')

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				dark: '#1B1919',
				light: "#FFFFFF",
				primary: {
					default: '#6366F1',
					light: '#ACA5FF',
					dark: '#ACA5FF'
				},
				secondary: "#6366F1",
			}
		}
	},

	plugins: []
};

module.exports = config;

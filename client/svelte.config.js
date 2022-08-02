import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
/** @type {import('@sveltejs/kit').Config} */

process.env.VITE_REQUEST_PATH = (process.env.NODE_ENV == "development")?"http://localhost:3002":"";

const config = {
	preprocess: [
		preprocess({
			postcss: true
		})
	],
	kit: {
		adapter: adapter(),
		prerender: {
			default: true,
		},
		trailingSlash: "always"
	}
};

export default config;

import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import data from './src/lib/data/faculty.json' with { type: 'json' };

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Every page is prerendered from src/lib/data/faculty.json, so the output is plain HTML.
			adapter: adapter(),
			// GitHub Pages serves the site under /<repo>, so its workflow sets BASE_PATH; elsewhere it is empty.
			// Absolute links so 404.html works at whatever depth a host serves it.
			paths: { base: (process.env.BASE_PATH ?? '') as '' | `/${string}`, relative: false },
			// Named after the data date instead of the build time, so building the same code twice
			// gives the same file names and a running preview never points at files that are gone.
			version: { name: data.updated }
		})
	],
	test: {
		expect: { requireAssertions: true },
		include: ['tests/unit/**/*.test.ts']
	}
});

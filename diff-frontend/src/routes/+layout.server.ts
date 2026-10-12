import { portal } from '$lib/server';
import type { LayoutServerLoad } from './$types';

export const prerender = true;

export const load: LayoutServerLoad = () => ({
	updated: portal.data.updated,
	sources: portal.data.sources
});

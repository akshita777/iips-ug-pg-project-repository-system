import { portal } from '$lib/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const all = portal.summaries();
	return {
		totals: portal.totals(),
		departments: portal.departments.map((d) => ({
			...d,
			count: all.filter((f) => f.department === d.id).length,
			papers: all.filter((f) => f.department === d.id).reduce((s, f) => s + f.papers, 0)
		})),
		top: portal.ranked().slice(0, 6),
		recent: portal.recentPapers(6),
		areas: portal.topAreas(14)
	};
};

import { portal } from '$lib/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const all = portal.faculty.map((f) => portal.scoreOf(f.slug).facts);
	const totals = portal.totals();
	return {
		rules: portal.rules,
		year: portal.year,
		setAside: all.reduce((s, x) => s + x.setAside, 0),
		withScholar: totals.withScholar,
		withOpenAlex: totals.withOpenAlex,
		faculty: portal.faculty.length
	};
};

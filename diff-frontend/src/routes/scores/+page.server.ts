import { portal } from '$lib/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const ranked = portal.ranked();
	const avg = (xs: number[]) =>
		xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
	return {
		ranked,
		departments: portal.departments.map((d) => {
			// averages only over people with a research profile, whose numbers are complete
			const mine = ranked.filter((f) => f.department === d.id && !f.partial);
			return { ...d, count: mine.length, average: avg(mine.map((f) => f.total)) };
		}),
		pillars: portal.rules.pillars.map((p) => ({
			id: p.id,
			label: p.label,
			about: p.about,
			max: p.parts.reduce((s, x) => s + x.max, 0)
		})),
		grades: portal.rules.grades.map((g) => ({
			...g,
			count: ranked.filter((f) => !f.partial && f.grade === g.grade).length
		})),
		partial: ranked.filter((f) => f.partial).length
	};
};

import { error } from '@sveltejs/kit';
import { paperUrl, type ScholarPublication } from '$lib/domain/types';
import { portal } from '$lib/server';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => portal.faculty.map((f) => ({ slug: f.slug }));

/** Papers that are not counted are listed up to this many; a merged OpenAlex record can hold hundreds. */
const ASIDE_LIMIT = 25;

export const load: PageServerLoad = ({ params }) => {
	const f = portal.find(params.slug);
	if (!f) error(404, 'No faculty member with this address');
	const { facts, sheet } = portal.scoreOf(f.slug);
	const r = f.record;
	const withUrl = (p: ScholarPublication) => ({ ...p, url: paperUrl(f.source, r, p) });
	const all = f.publications();
	const aside = all.filter((p) => p.flag);

	// the page only needs the source in use, without its paper list
	const strip = <T extends { publications: unknown[] }>(x: T | null) => {
		if (!x) return null;
		const { publications: _p, ...rest } = x;
		return rest;
	};

	return {
		faculty: { ...r, scholar: strip(r.scholar), openalex: strip(r.openalex) },
		initials: f.initials,
		department: portal.departments.find((d) => d.id === r.department)!,
		source: f.source,
		papers: f.counted().map(withUrl),
		aside: aside.slice(0, ASIDE_LIMIT).map(withUrl),
		asideCount: aside.length,
		facts,
		sheet,
		rank: portal.rankOf(f.slug),
		graded: portal.summaries().filter((s) => !s.partial).length,
		percentile: portal.percentileOf(f.slug),
		medians: portal.pillarMedians(),
		recentYears: portal.rules.recentYears,
		year: portal.year
	};
};

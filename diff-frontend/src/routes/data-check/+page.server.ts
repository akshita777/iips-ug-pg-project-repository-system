import { portal } from '$lib/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	rows: portal.faculty.map((f) => {
		const r = f.record;
		const s = r.scholar;
		const oa = r.openalex;
		const used = s ?? oa;
		return {
			slug: r.slug,
			name: r.name,
			department: r.department,
			source: f.source,
			confidence: used?.match.confidence ?? null,
			evidence: used?.match.evidence ?? [],
			note: used?.match.note ?? '',
			scholar: s
				? {
						id: s.id,
						name: s.name,
						affiliation: s.affiliation,
						decidedBy: s.match.decidedBy,
						counted: s.publications.filter((p) => !p.flag).length
					}
				: null,
			openalex: oa
				? {
						id: oa.ids[0],
						records: oa.ids.length,
						counted: oa.publications.filter((p) => !p.flag).length
					}
				: null,
			rejected: r.scholarSearch.candidates
		};
	}),
	departments: portal.departments
});

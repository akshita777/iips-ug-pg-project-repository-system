/**
 * Step 2b: finds each faculty member in OpenAlex, the open research database (openalex.org).
 * Used for people Google Scholar has no profile for, and as a cross check for those it has.
 *
 *   node scripts/data/openalex.ts
 *
 * Needs scripts/data/out/iips.json. Searches authors with a DAVV affiliation, reads their works
 * and scores each candidate on evidence, like scholar.ts. OpenAlex sometimes merges namesakes
 * into one author record and sometimes splits one person in two, so:
 *   - every accepted record of the person is merged
 *   - a paper only counts when it ties the person to IIPS or DAVV by itself (affiliation printed
 *     on the paper, listed on the IIPS site, or a Ph.D. scholar or colleague as co-author), except
 *     for a rare name held by one DAVV author, where any paper in an IIPS subject counts
 * Writes scripts/data/out/openalex.json. Cached in .cache/scrape like the other steps.
 */
import { join } from 'node:path';
import type { IipsFaculty } from './iips.ts';
import { OUT, cachedFetch, clean, nameTokens, readJson, stripTitle, writeJson } from './lib.ts';
import {
	COMMON_SURNAMES,
	authorListHas,
	nameFit,
	titleListed,
	type Candidate,
	type Evidence,
	type ScholarPub
} from './scholar.ts';

const API = 'https://api.openalex.org';
/** Devi Ahilya Vishwavidyalaya in OpenAlex. */
const DAVV = 'I138272832';
const GAP: [number, number] = [250, 400];

/** Subjects no IIPS department works in. */
const OTHER_FIELDS = new Set([
	'Chemistry',
	'Physics and Astronomy',
	'Medicine',
	'Biochemistry, Genetics and Molecular Biology',
	'Agricultural and Biological Sciences',
	'Immunology and Microbiology',
	'Pharmacology, Toxicology and Pharmaceutics',
	'Neuroscience',
	'Nursing',
	'Dentistry',
	'Veterinary',
	'Health Professions',
	'Materials Science',
	'Earth and Planetary Sciences',
	'Chemical Engineering',
	'Environmental Science'
]);

const IIPS_AFFIL =
	/Institute of Professional Studies|\bIIPS\b.*(Indore|DAVV|Devi Ahilya)|(Indore|DAVV|Devi Ahilya).*\bIIPS\b/i;
const DAVV_AFFIL = /Devi Ahilya|\bD\.?A\.?V\.?V\b/i;

export interface OpenAlexWork extends ScholarPub {
	type: 'journal' | 'conference' | 'book' | 'chapter' | 'thesis' | 'other';
	/** The subject OpenAlex gives the paper, e.g. "Computer Science". */
	field: string;
	/** This person's affiliation on the paper names IIPS. */
	iips: boolean;
	/** ... or DAVV. */
	davv: boolean;
	doi: string | null;
	/** Why the paper does not count, set by tieWorks(). */
	flag: 'other-field' | 'unconfirmed' | null;
}

export interface OpenAlexProfile {
	/** Every accepted OpenAlex record of the person, best first. */
	ids: string[];
	name: string;
	orcid: string | null;
	works: OpenAlexWork[];
}

export interface OpenAlexMatch {
	slug: string;
	query: string;
	candidates: Candidate[];
	chosen: string[];
	note: string;
	profile: OpenAlexProfile | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any -- raw OpenAlex JSON */
const getJson = async (url: string): Promise<any> =>
	JSON.parse(await cachedFetch(url, { gapMs: GAP }));

function workType(w: any): OpenAlexWork['type'] | null {
	const source = w.primary_location?.source?.type ?? '';
	switch (w.type) {
		case 'article':
		case 'review':
			return source === 'conference' ? 'conference' : 'journal';
		case 'book':
			return 'book';
		case 'book-chapter':
			return 'chapter';
		case 'dissertation':
			return 'thesis';
		case 'paratext':
		case 'erratum':
		case 'retraction':
		case 'peer-review':
		case 'supplementary-materials':
			return null;
		default:
			return 'other';
	}
}

/** "Pragya Singh Tomar" gives "PS Tomar", so author lists read like Scholar's. */
function short(full: string): string {
	const t = clean(full).split(' ').filter(Boolean);
	if (t.length < 2) return clean(full);
	const initials = t
		.slice(0, -1)
		.map((w) => w[0]?.toUpperCase() ?? '')
		.join('');
	return `${initials} ${t.at(-1)}`;
}

async function readWorks(authorId: string): Promise<OpenAlexWork[]> {
	const out: OpenAlexWork[] = [];
	let cursor = '*';
	while (cursor) {
		const page = await getJson(
			`${API}/works?filter=author.id:${authorId}&per-page=200&cursor=${encodeURIComponent(cursor)}` +
				'&select=id,doi,title,publication_year,cited_by_count,type,primary_location,authorships,primary_topic'
		);
		for (const w of page.results ?? []) {
			const type = workType(w);
			if (!type || !w.title) continue;
			const mine = (w.authorships ?? []).find((a: any) => a.author?.id?.endsWith(authorId));
			const raw: string[] = mine?.raw_affiliation_strings ?? [];
			out.push({
				key: w.id.split('/').pop(),
				title: clean(w.title),
				authors: (w.authorships ?? [])
					.map((a: any) => short(a.author?.display_name ?? ''))
					.join(', '),
				venue: clean(w.primary_location?.source?.display_name),
				year: w.publication_year ?? null,
				citations: w.cited_by_count ?? 0,
				type,
				field: w.primary_topic?.field?.display_name ?? '',
				iips: raw.some((s) => IIPS_AFFIL.test(s)),
				davv:
					raw.some((s) => DAVV_AFFIL.test(s)) ||
					(mine?.institutions ?? []).some((i: any) => i.id?.endsWith(DAVV)),
				doi: w.doi ?? null,
				flag: null
			});
		}
		cursor = page.meta?.next_cursor ?? '';
		if (!page.results?.length) break;
	}
	return out;
}

/** People and papers that tie a work to this person at IIPS. */
function tiesOf(person: IipsFaculty, everyone: IipsFaculty[]) {
	const listed = [
		...person.listedPublications,
		...(person.sections['Published Papers in Journals'] ?? []).map((r) => r.cells.join(' '))
	];
	const students = (person.sections['Registered Ph.D. Candidates List'] ?? [])
		.map((r) => r.cells[0])
		.filter(Boolean);
	const colleagues = everyone
		.filter((f) => f.slug !== person.slug && !COMMON_SURNAMES.has(nameTokens(f.name).at(-1)!))
		.map((f) => f.name);
	return { listed, students, colleagues };
}

/**
 * Marks the papers that do not count: a subject no IIPS department works in (unless the paper
 * names IIPS), or no IIPS or DAVV link at all (unless the name is rare).
 */
export function tieWorks(
	works: OpenAlexWork[],
	person: IipsFaculty,
	everyone: IipsFaculty[],
	rareName: boolean
) {
	const { listed, students, colleagues } = tiesOf(person, everyone);
	return works.map((w) => {
		const tied =
			w.iips ||
			titleListed(w.title, listed) ||
			[...students, ...colleagues].some((n) => authorListHas(w.authors, n));
		const flag: OpenAlexWork['flag'] =
			OTHER_FIELDS.has(w.field) && !tied
				? 'other-field'
				: tied || w.davv || rareName
					? null
					: 'unconfirmed';
		return { ...w, flag };
	});
}

/** Same checks as scholar.ts, plus the affiliation and subject of every paper. */
export function scoreAuthor(
	person: IipsFaculty,
	name: string,
	works: OpenAlexWork[],
	everyone: IipsFaculty[],
	davvNamesakes: number
): Candidate {
	const evidence: Evidence[] = [];
	const add = (kind: Evidence['kind'], points: number, text: string) =>
		evidence.push({ kind, points, text });
	const { listed, students, colleagues } = tiesOf(person, everyone);

	const fit = nameFit(person.name, name);
	if (fit === 2) add('name', 20, `Name matches: ${name}`);
	else if (fit === 1) add('name', 10, `Initials and surname match: ${name}`);
	else add('name', 0, `Only the surname matches: ${name}`);

	const atIips = works.filter((w) => w.iips).length;
	const atDavv = works.filter((w) => w.davv).length;
	const surname = nameTokens(person.name).at(-1)!;
	if (atIips)
		add('affiliation', atIips >= 3 ? 50 : 40, `IIPS named as affiliation on ${atIips} paper(s)`);
	else if (atDavv && davvNamesakes === 1 && !COMMON_SURNAMES.has(surname))
		add('affiliation', 25, `Only DAVV author with this name; DAVV on ${atDavv} paper(s)`);

	const same = works.filter((w) => titleListed(w.title, listed));
	if (same.length)
		add(
			'iips-paper',
			same.length >= 3 ? 40 : 30,
			`${same.length} paper(s) also listed on the IIPS site, e.g. "${same[0].title}"`
		);

	const allAuthors = works.map((w) => w.authors).join(', ');
	const coStudents = students.filter((s) => authorListHas(allAuthors, s));
	if (coStudents.length) {
		const rare = coStudents.filter((s) => !COMMON_SURNAMES.has(nameTokens(s).at(-1)!));
		const points = Math.min(40, rare.length * 25 + (coStudents.length - rare.length) * 8);
		add(
			'phd-coauthor',
			points,
			`Ph.D. scholar(s) as co-author: ${coStudents.map(stripTitle).join(', ')}`
		);
	}
	const coColleagues = colleagues.filter((n) => authorListHas(allAuthors, n));
	if (coColleagues.length)
		add(
			'colleague',
			Math.min(20, coColleagues.length * 8),
			`IIPS colleague(s) as co-author: ${coColleagues.map(stripTitle).join(', ')}`
		);

	// a record mostly in other subjects with little IIPS trace is a namesake, or several merged
	const away = works.filter((w) => OTHER_FIELDS.has(w.field));
	if (works.length && away.length / works.length > 0.3 && atIips < 3)
		add(
			'interests',
			-40,
			`${away.length} of ${works.length} papers are in subjects such as ${away[0].field}`
		);

	const points = evidence.reduce((s, e) => s + e.points, 0);
	const ties = evidence.filter(
		(e) => ['affiliation', 'iips-paper', 'phd-coauthor'].includes(e.kind) && e.points >= 25
	);
	const confidence =
		fit >= 1 && ties.length && points >= 70
			? 'high'
			: fit >= 1 && ties.length && points >= 40
				? 'medium'
				: 'low';
	return {
		id: '',
		name,
		affiliation: atIips ? 'IIPS, DAVV' : 'DAVV',
		emailDomain: '',
		citations: works.reduce((s, w) => s + w.citations, 0),
		points,
		confidence,
		evidence
	};
}

async function matchOne(person: IipsFaculty, everyone: IipsFaculty[]): Promise<OpenAlexMatch> {
	const query = stripTitle(person.name).replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
	const found = await getJson(
		`${API}/authors?search=${encodeURIComponent(query)}&filter=affiliations.institution.id:${DAVV}&per-page=8`
	);
	const authors = (found.results ?? []).filter(
		(a: any) => nameFit(person.name, a.display_name) >= 1
	);
	const candidates: (Candidate & { orcid: string | null; works: OpenAlexWork[] })[] = [];
	for (const a of authors) {
		const id = a.id.split('/').pop();
		const works = await readWorks(id);
		const c = scoreAuthor(person, clean(a.display_name), works, everyone, authors.length);
		candidates.push({ ...c, id, orcid: a.orcid ?? null, works });
	}
	candidates.sort((a, b) => b.points - a.points || b.citations - a.citations);
	const accepted = candidates.filter((c) => c.confidence !== 'low');

	let profile: OpenAlexProfile | null = null;
	if (accepted.length) {
		const seen = new Set<string>();
		const works = accepted
			.flatMap((c) => c.works)
			.filter((w) => !seen.has(w.key) && seen.add(w.key));
		profile = {
			ids: accepted.map((c) => c.id),
			name: accepted[0].name,
			orcid: accepted.find((c) => c.orcid)?.orcid ?? null,
			works: tieWorks(
				works,
				person,
				everyone,
				authors.length === 1 && !COMMON_SURNAMES.has(nameTokens(person.name).at(-1)!)
			)
		};
	}
	return {
		slug: person.slug,
		query,
		candidates: candidates.map(({ works: _w, orcid: _o, ...c }) => c),
		chosen: accepted.map((c) => c.id),
		note: accepted.length
			? accepted.length > 1
				? `OpenAlex splits this person into ${accepted.length} records; merged`
				: ''
			: candidates.length
				? 'Only weak candidates found'
				: 'Not found in OpenAlex',
		profile
	};
}

async function main() {
	const { faculty } = readJson<{ faculty: IipsFaculty[] }>(join(OUT, 'iips.json'));
	const results: Record<string, OpenAlexMatch> = {};
	for (const person of faculty) {
		const m = await matchOne(person, faculty);
		results[person.slug] = m;
		const best = m.candidates.find((c) => c.id === m.chosen[0]);
		const counted = m.profile?.works.filter((w) => !w.flag).length ?? 0;
		console.log(
			`${person.name.padEnd(28)} ${best ? `${m.chosen.join('+')} ${best.confidence} (${best.points} pts) ${counted}/${m.profile!.works.length} works count` : 'none'} ${m.note}`
		);
	}
	writeJson(join(OUT, 'openalex.json'), results);
	console.log('Wrote scripts/data/out/openalex.json');
}

if (import.meta.main) await main();

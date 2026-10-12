/**
 * Step 3: merges the IIPS profiles with the Scholar and OpenAlex profiles into
 * src/lib/data/faculty.json, cleans the publication lists and prints a validation report.
 *
 *   node scripts/data/build.ts
 *
 * Cleaning, so scores only count work that is really this person's:
 *   - type: journal, conference, book, chapter, patent, thesis or other, from the venue text
 *   - "before-career": dated more than 6 years before the person started teaching
 *     (Scholar often attaches an old paper by a namesake)
 *   - "not-author": the full author list does not contain the person
 *   - "duplicate": same title as another entry on the profile
 *   - "manual": listed in scripts/data/exclusions.json after a check by hand, with the reason
 * Flagged papers stay in the file (with the reason) but are not counted.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { IipsFaculty, IipsRow } from './iips.ts';
import { OUT, PORTAL, ROOT, clean, readJson, writeJson } from './lib.ts';
import type { OpenAlexMatch } from './openalex.ts';
import { COMMON_SURNAMES, authorListHas, type ScholarMatch, type ScholarPub } from './scholar.ts';

const TODAY = new Date();
const YEAR = TODAY.getFullYear();
const CAREER_SLACK = 6;

export type PubType = 'journal' | 'conference' | 'book' | 'chapter' | 'patent' | 'thesis' | 'other';
export type PubFlag = 'before-career' | 'not-author' | 'duplicate' | 'manual';

/** Guesses the kind of publication from Scholar's venue line. */
export function classify(venue: string, title = ''): PubType {
	const v = venue.toLowerCase();
	if (/\bpatent\b/.test(v) || /^patent\b/i.test(title)) return 'patent';
	if (/thesis|dissertation|shodhganga|\bph\.?\s?d\b/.test(v)) return 'thesis';
	if (
		/conference|proceedings|symposium|workshop|congress|\bconf\b|seminar|summit|lecture notes|\bicc\w*\b/.test(
			v
		) ||
		// acronym with a year, e.g. "CCCC-2015" or "VirtualCom-2016"
		/\b[A-Z][A-Za-z]*[A-Z][A-Za-z]*[-\s]?(19|20)\d{2}\b/.test(venue)
	)
		return 'conference';
	if (
		/\bchapter\b|handbook|\bin:\s|edited (book|volume)|igi global|crc press|apple academic/.test(v)
	)
		return 'chapter';
	if (
		/journal|transactions|\breview\b|letters|magazine|\bint\.? j|\bj\.\s|bulletin|quarterly|annals|archives|\bresearch\b|studies|\bsciences?\b|issn|\bvol\b/.test(
			v
		) ||
		/\d+\s*\(\s*\d+\s*\)/.test(v) ||
		/[a-z]\s\d+,\s*\d/.test(v)
	)
		return 'journal';
	if (
		/publish|publication house|press\b|\bbooks?\b|lambert|himalaya|wiley|mcgraw|pearson|vikas|chand|notion|prentice|excel|springer( nature)?$/.test(
			v
		)
	)
		return 'book';
	// "Book title, 50-63": a chapter with its page range
	if (/^[^,\d]{12,},\s*\d+(-\d+)?$/.test(v)) return 'chapter';
	return 'other';
}

const letters = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z\s]/g, ' ')
		.split(/\s+/)
		.filter(Boolean);

function editDistance(a: string, b: string): number {
	const d = Array.from({ length: b.length + 1 }, (_, j) => j);
	for (let i = 1; i <= a.length; i++) {
		let prev = d[0];
		d[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const keep = d[j];
			d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
			prev = keep;
		}
	}
	return d[b.length];
}

/**
 * Loose check that an author list mentions a person at all. Hand typed Scholar entries use
 * "P Shaligram", "Y Sheikh" or the owner's initials glued on ("SP Nitin Naik"), so any of
 * surname (or a one letter misspelling), first name or initials is enough.
 */
export function mentions(authors: string, name: string): boolean {
	const want = letters(name.replace(/^\s*(dr|prof|mr|ms|mrs)\.?\s+/i, '')).filter(
		(t) => !['dr', 'prof', 'ph', 'd', 'phd'].includes(t)
	);
	const surname = want.at(-1) ?? '';
	const first = want.length > 1 && want[0].length > 2 ? want[0] : '';
	const initials = want.map((t) => t[0]).join('');
	return letters(authors).some(
		(t) =>
			t === surname ||
			(surname.length >= 5 && t.length >= 5 && editDistance(t, surname) <= 1) ||
			(first && t === first) ||
			(initials.length >= 2 && t.length >= 2 && t.length <= 5 && t.startsWith(initials))
	);
}

/** "Over 26 Years" gives 26. */
export function years(text: string): number | null {
	const m = /(\d+)/.exec(text);
	return m ? Number(m[1]) : null;
}

const titleKey = (t: string) =>
	t
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
const titleWords = (t: string) => titleKey(t).split(' ');

export function hIndex(citations: number[]): number {
	const sorted = [...citations].sort((a, b) => b - a);
	let h = 0;
	while (h < sorted.length && sorted[h] >= h + 1) h++;
	return h;
}

/** Scholar sometimes has a typing slip in the year (1930 for a 2013 paper); such years are dropped. */
const plausibleYear = (y: number | null) => (y && y >= 1950 && y <= YEAR + 1 ? y : null);

/**
 * Same paper: equal titles, or one title (6 words or more) starts the other, as when Scholar
 * keeps a cut off copy ("... for Consumer GPUs" and "... for Consumer GPUs in Edge Devices").
 */
export function sameTitle(a: string[], b: string[]): boolean {
	const [short, long] = a.length <= b.length ? [a, b] : [b, a];
	if (short.length === long.length) return short.every((w, i) => w === long[i]);
	return short.length >= 6 && short.every((w, i) => w === long[i]);
}

/**
 * Adds a type and, when the paper should not count, a flag with the reason.
 * @param names the person's names (IIPS and Scholar spelling)
 * @param careerStart year the person started teaching, if known
 * @param ties Ph.D. scholars and IIPS colleagues: a paper shared with one of them is never a namesake's
 */
export function cleanPublications(
	pubs: ScholarPub[],
	names: string[],
	careerStart: number | null,
	ties: string[] = []
): (ScholarPub & { type: PubType; flag: PubFlag | null })[] {
	const kept: string[][] = [];
	// most cited first, so the copy that is kept is the one Scholar counts most
	const order = pubs.map((p, i) => i).sort((a, b) => pubs[b].citations - pubs[a].citations);
	const flags: (PubFlag | null)[] = pubs.map(() => null);
	for (const i of order) {
		const p = pubs[i];
		const words = titleKey(p.title).split(' ');
		const truncated = /\.\.\.\s*$|\u2026\s*$/.test(p.authors);
		const tied = ties.some((t) => authorListHas(p.authors, t));
		if (careerStart && p.year && p.year < careerStart - CAREER_SLACK && !tied)
			flags[i] = 'before-career';
		else if (p.authors && !truncated && !names.some((n) => mentions(p.authors, n)))
			flags[i] = 'not-author';
		else if (kept.some((k) => sameTitle(k, words))) flags[i] = 'duplicate';
		else kept.push(words);
	}
	return pubs.map((p, i) => ({
		...p,
		year: plausibleYear(p.year),
		type: classify(p.venue, p.title),
		flag: flags[i]
	}));
}

const rows = (f: IipsFaculty, heading: string): IipsRow[] => f.sections[heading] ?? [];

function phdStatus(text: string): 'awarded' | 'submitted' | 'ongoing' {
	if (/award/i.test(text)) return 'awarded';
	if (/submit/i.test(text)) return 'submitted';
	return 'ongoing';
}

function emails(text: string): string[] {
	return text
		.replace(/\s*@\s*/g, '@')
		.split(/[\s,;/]+/)
		.filter((e) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(e))
		.map((e) => e.toLowerCase());
}

function splitList(text: string): string[] {
	return [
		...new Set(
			text
				.split(/\s*,\s*/)
				.map(clean)
				.filter(Boolean)
		)
	];
}

/** Profile papers plus the Research > Publication page, without repeats. */
function iipsPapers(f: IipsFaculty): { text: string; link: string | null }[] {
	const out = rows(f, 'Published Papers in Journals').map((r) => ({
		text: r.cells.join(' '),
		link: r.link
	}));
	const keys = new Set(out.map((p) => titleKey(p.text)));
	for (const text of f.listedPublications) {
		const k = titleKey(text);
		if (!keys.has(k)) {
			keys.add(k);
			out.push({ text, link: null });
		}
	}
	return out;
}

/** The fields of a paper that go into faculty.json, from either source. */
function publication(x: {
	title: string;
	authors: string;
	venue: string;
	year: number | null;
	citations: number;
	type: PubType;
	flag: string | null;
	key: string;
	note?: string;
	doi?: string | null;
}) {
	return {
		title: x.title,
		authors: x.authors,
		venue: x.venue,
		year: x.year,
		citations: x.citations,
		type: x.type,
		flag: x.flag,
		key: x.key,
		...(x.doi ? { doi: x.doi } : {}),
		...(x.note ? { note: x.note } : {})
	};
}

function build() {
	const iips = readJson<{ fetchedAt: string; faculty: IipsFaculty[] }>(join(OUT, 'iips.json'));
	const optional = <T>(file: string, empty: T): T =>
		existsSync(join(OUT, file)) ? readJson<T>(join(OUT, file)) : empty;
	const scholar = optional<Record<string, ScholarMatch>>('scholar.json', {});
	const openalex = optional<Record<string, OpenAlexMatch>>('openalex.json', {});
	const exclusionsFile = join(ROOT, 'scripts', 'data', 'exclusions.json');
	const exclusions: Record<string, { key: string; reason: string }[]> = existsSync(exclusionsFile)
		? readJson(exclusionsFile)
		: {};

	// Who lists whom in the Scholar co-author box: an independent check of each link.
	const nameOf = new Map(iips.faculty.map((f) => [f.slug, f.name]));
	const linkedFrom = new Map<string, string[]>();
	for (const m of Object.values(scholar))
		for (const c of m.profile?.coauthors ?? [])
			linkedFrom.set(c.id, [...(linkedFrom.get(c.id) ?? []), nameOf.get(m.slug) ?? m.slug]);

	const problems: string[] = [];
	const faculty = iips.faculty.map((f) => {
		const teachingYears = years(f.teachingExperience);
		const careerStart = teachingYears ? YEAR - teachingYears : null;
		const m = scholar[f.slug];
		const chosen = m?.candidates.find((c) => c.id === m.chosen);
		const p = m?.profile ?? null;
		const oa = openalex[f.slug];
		const op = oa?.profile ?? null;

		if (!f.designation) problems.push(`${f.name}: no designation`);
		if (!f.photo) problems.push(`${f.name}: no photo`);
		if (!m) problems.push(`${f.name}: Scholar search not run yet`);

		const ties = [
			...rows(f, 'Registered Ph.D. Candidates List').map((r) => r.cells[0] ?? ''),
			...iips.faculty.filter((g) => g.slug !== f.slug).map((g) => g.name)
		].filter(
			(n) =>
				n &&
				!COMMON_SURNAMES.has(
					n
						.toLowerCase()
						.split(/[\s.]+/)
						.at(-1) ?? ''
				)
		);
		const removed = new Map((exclusions[f.slug] ?? []).map((x) => [x.key, x.reason]));
		const byHand = <T extends { key: string; flag: string | null }>(x: T) =>
			removed.has(x.key) ? { ...x, flag: 'manual' as const, note: removed.get(x.key) } : x;
		const pubs = (
			p ? cleanPublications(p.publications, [f.name, p.name], careerStart, ties) : []
		).map(byHand);

		// OpenAlex papers keep their own type and tie checks, then get the same cleaning
		const works = op?.works ?? [];
		const open = works.filter((w) => !w.flag);
		const cleaned = cleanPublications(open, [f.name, op?.name ?? f.name], careerStart, ties);
		const oaPubs = works
			.map((w) => {
				const c = w.flag ? null : cleaned[open.indexOf(w)];
				return {
					...w,
					year: c ? c.year : w.year,
					flag: (w.flag ?? c?.flag ?? null) as string | null
				};
			})
			.map(byHand);

		for (const key of removed.keys())
			if (!pubs.some((x) => x.key === key) && !oaPubs.some((x) => x.key === key))
				problems.push(`${f.name}: exclusion ${key} matches no paper`);

		// the same papers turning up in both sources is a further check of the Scholar link
		const oaTitles = oaPubs.filter((x) => !x.flag).map((x) => titleWords(x.title));
		const shared = pubs.filter(
			(x) => !x.flag && oaTitles.some((t) => sameTitle(t, titleWords(x.title)))
		).length;
		const oaChosen = oa?.candidates.find((c) => c.id === oa.chosen[0]);
		if (p && !p.complete) problems.push(`${f.name}: Scholar list incomplete`);
		if (p) {
			const h = hIndex(p.publications.map((x) => x.citations));
			if (p.complete && h !== p.metrics.h)
				problems.push(`${f.name}: h-index from papers is ${h}, Scholar shows ${p.metrics.h}`);
		}

		return {
			slug: f.slug,
			iipsId: f.iipsId,
			name: f.name,
			department: f.department,
			order: f.order,
			designation: f.designation,
			qualification: f.qualification,
			specialization: splitList(f.specialization),
			teachingYears,
			teachingExperience: f.teachingExperience,
			industryExperience: f.industryExperience,
			emails: emails(f.email),
			photo: f.photo,
			responsibilities: [
				...(f.responsibility ? [f.responsibility] : []),
				...rows(f, 'Untitled').map((r) => r.cells.join(' '))
			],
			memberships: rows(f, 'Membership of various professional bodies List').map((r) => r.cells[0]),
			projects: rows(f, 'Projects Or Consultancies').map((r) => ({
				title: r.cells[0] ?? '',
				agency: r.cells[1] ?? '',
				status: r.cells[2] ?? ''
			})),
			workshops: rows(f, 'Workshop attended / FDP').map((r) => r.cells.filter(Boolean).join(', ')),
			phd: rows(f, 'Registered Ph.D. Candidates List').map((r) => ({
				name: r.cells[0] ?? '',
				topic: r.cells.length > 2 ? r.cells[1] : '',
				status: phdStatus(r.cells.at(-1) ?? '')
			})),
			iipsPapers: iipsPapers(f),
			scholar:
				p && m
					? {
							id: p.id,
							name: p.name,
							affiliation: p.affiliation,
							emailDomain: p.emailDomain,
							interests: p.interests,
							match: {
								confidence: chosen?.confidence ?? 'high',
								decidedBy: m.decidedBy,
								points: chosen?.points ?? null,
								evidence: [
									...(chosen?.evidence ?? []).filter((e) => e.points > 0).map((e) => e.text),
									...(linkedFrom.has(p.id)
										? [
												`Listed as co-author on the Scholar profile of ${linkedFrom.get(p.id)!.join(', ')}`
											]
										: []),
									...(shared ? [`${shared} of these papers also found in OpenAlex`] : [])
								],
								note: m.note
							},
							reported: p.metrics,
							citesPerYear: p.citesPerYear,
							complete: p.complete,
							publications: pubs.map(publication)
						}
					: null,
			scholarSearch: {
				queries: m?.queries ?? [],
				note: m?.note ?? '',
				candidates: (m?.candidates ?? [])
					.filter((c) => c.id !== m?.chosen)
					.map((c) => ({
						id: c.id,
						name: c.name,
						affiliation: c.affiliation,
						confidence: c.confidence
					}))
			},
			openalex:
				op && oa && oaChosen
					? {
							ids: op.ids,
							name: op.name,
							orcid: op.orcid,
							match: {
								confidence: oaChosen.confidence,
								evidence: oaChosen.evidence.filter((e) => e.points > 0).map((e) => e.text),
								note: oa.note
							},
							publications: oaPubs.map(publication)
						}
					: null
		};
	});

	const counts = { cs: 0, mgmt: 0 };
	for (const f of faculty) counts[f.department]++;
	const linked = faculty.filter((f) => f.scholar);
	const onlyOpen = faculty.filter((f) => !f.scholar && f.openalex);
	const flagged = linked.flatMap((f) => f.scholar!.publications.filter((p) => p.flag));

	writeJson(join(PORTAL, 'src', 'lib', 'data', 'faculty.json'), {
		version: 1,
		updated: TODAY.toISOString().slice(0, 10),
		sources: {
			iips: 'https://iips.edu.in/faculty_profile.php',
			iipsFetched: iips.fetchedAt.slice(0, 10),
			scholar: 'https://scholar.google.com',
			openalex: 'https://openalex.org'
		},
		departments: [
			{ id: 'cs', name: 'Computer Science', short: 'Computer' },
			{ id: 'mgmt', name: 'Management', short: 'Management' }
		],
		faculty
	});

	// one row per person, to tick off by hand in a spreadsheet
	const status = (c: string | undefined) =>
		c === 'high' ? 'Verified' : c === 'medium' ? 'Please check' : 'Not found';
	const lines = [
		['Name', 'Department', 'Google Scholar', 'OpenAlex', 'Status', 'Checked (yes/no)'],
		...faculty.map((f) => [
			f.name,
			f.department === 'cs' ? 'Computer Science' : 'Management',
			f.scholar ? `https://scholar.google.com/citations?user=${f.scholar.id}` : '',
			f.openalex ? `https://openalex.org/${f.openalex.ids[0]}` : '',
			status(f.scholar?.match.confidence ?? f.openalex?.match.confidence),
			''
		])
	];
	const csv = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
	// the byte order mark makes Excel read the file as UTF-8
	const rowsOut = lines.map((r) => r.map(csv).join(',')).join('\r\n');
	writeFileSync(join(OUT, 'faculty-links.csv'), '\uFEFF' + rowsOut + '\r\n');

	const by = (c: string) => linked.filter((f) => f.scholar!.match.confidence === c).length;
	console.log(`Faculty: ${faculty.length} (Computer ${counts.cs}, Management ${counts.mgmt})`);
	console.log(
		`Scholar: ${linked.length} (high ${by('high')}, medium ${by('medium')}), OpenAlex only: ${onlyOpen.length}, neither: ${faculty.length - linked.length - onlyOpen.length}`
	);
	console.log(
		`Scholar papers: ${linked.reduce((s, f) => s + f.scholar!.publications.length, 0)}, ${flagged.length} set aside (${['before-career', 'not-author', 'duplicate', 'manual'].map((k) => `${k} ${flagged.filter((p) => p.flag === k).length}`).join(', ')})`
	);
	if (problems.length) console.log('Check:\n  ' + problems.join('\n  '));
	console.log('Wrote src/lib/data/faculty.json and scripts/data/out/faculty-links.csv');
}

if (import.meta.main) build();

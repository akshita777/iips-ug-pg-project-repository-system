/**
 * Step 2: finds each faculty member's Google Scholar profile and reads it.
 *
 *   node scripts/data/scholar.ts              all faculty
 *   node scripts/data/scholar.ts kirti-mathur one person (by slug)
 *   node scripts/data/scholar.ts --rescore    no searches: checks the profiles already found and
 *                                             the hinted ones with the current rules (use it while
 *                                             Scholar blocks searching; profile pages still load)
 *
 * Needs scripts/data/out/iips.json (step 1). For every person it searches Scholar, collects the
 * candidate profiles, and scores each one on independent evidence (verified email domain,
 * affiliation, Ph.D. students or IIPS colleagues as co-authors, papers also listed on the IIPS
 * site). The best candidate is kept with its evidence, so a person can check it.
 * scripts/data/hints.json adds profile ids found elsewhere (they are checked the same way) and
 * scripts/data/overrides.json pins or rejects a profile by hand.
 *
 * Writes scripts/data/out/scholar.json. Requests are slow on purpose (12 to 20 s apart) and cached.
 */
import { parse, type HTMLElement } from 'node-html-parser';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { IipsFaculty } from './iips.ts';
import {
	BlockedError,
	OUT,
	ROOT,
	cachedFetch,
	clean,
	nameTokens,
	readJson,
	stripTitle,
	writeJson
} from './lib.ts';

const BASE = 'https://scholar.google.com';
const GAP: [number, number] = [12000, 20000];
const MAX_CANDIDATES = 3;

export interface ScholarPub {
	title: string;
	authors: string;
	venue: string;
	year: number | null;
	citations: number;
	/** Scholar's own id for the paper inside this profile. */
	key: string;
}

export interface ScholarProfile {
	id: string;
	name: string;
	affiliation: string;
	/** "iips.edu.in" from "Verified email at iips.edu.in", or "". */
	emailDomain: string;
	interests: string[];
	hasPhoto: boolean;
	metrics: {
		citations: number;
		citationsRecent: number;
		h: number;
		hRecent: number;
		i10: number;
		i10Recent: number;
		/** First year of the "recent" column, e.g. 2021. */
		recentSince: number;
	};
	citesPerYear: { year: number; count: number }[];
	coauthors: { id: string; name: string; affiliation: string }[];
	publications: ScholarPub[];
	/** True when every page of publications was read. */
	complete: boolean;
}

export interface Evidence {
	kind:
		'name' | 'email' | 'affiliation' | 'iips-paper' | 'phd-coauthor' | 'colleague' | 'interests';
	points: number;
	text: string;
}

export interface Candidate {
	id: string;
	name: string;
	affiliation: string;
	emailDomain: string;
	citations: number;
	points: number;
	confidence: 'high' | 'medium' | 'low';
	evidence: Evidence[];
}

export interface ScholarMatch {
	slug: string;
	queries: string[];
	candidates: Candidate[];
	/** Chosen profile id, or null when nothing good enough was found. */
	chosen: string | null;
	decidedBy: 'evidence' | 'override' | 'none';
	note: string;
	profile: ScholarProfile | null;
}

interface Override {
	scholarId: string | null;
	note?: string;
}

/* ------------------------------------------------------------------ parsing */

const num = (s: string | undefined) => Number((s ?? '').replace(/[^\d]/g, '')) || 0;

function parseProfile(id: string, html: string): Omit<ScholarProfile, 'publications' | 'complete'> {
	const doc = parse(html);
	const std = doc.querySelectorAll('#gsc_rsb_st td.gsc_rsb_std').map((td) => num(td.text));
	const since = num(doc.querySelectorAll('#gsc_rsb_st th.gsc_rsb_sth')[2]?.text);
	const lines = doc.querySelectorAll('#gsc_prf_i .gsc_prf_il');
	const emailLine =
		lines.map((l) => clean(l.text)).find((t) => /^Verified email at /i.test(t)) ?? '';
	const affiliation = clean(lines[0]?.text);

	// The citation chart: bars and year labels are both placed by their "right" offset.
	const labels = doc.querySelectorAll('.gsc_g_t').map((el) => ({
		year: num(el.text),
		right: num(/right:(\d+)px/.exec(el.getAttribute('style') ?? '')?.[1])
	}));
	const citesPerYear = labels.map((l) => ({ year: l.year, count: 0 }));
	for (const bar of doc.querySelectorAll('.gsc_g_a')) {
		const right = num(/right:(\d+)px/.exec(bar.getAttribute('style') ?? '')?.[1]);
		let best = -1;
		for (let i = 0; i < labels.length; i++)
			if (best < 0 || Math.abs(labels[i].right - right) < Math.abs(labels[best].right - right))
				best = i;
		if (best >= 0) citesPerYear[best].count = num(bar.querySelector('.gsc_g_al')?.text);
	}

	const coauthors = doc.querySelectorAll('#gsc_rsb_co .gsc_rsb_aa').map((el) => {
		const a = el.querySelector('.gsc_rsb_a_desc a');
		return {
			id: /user=([\w-]+)/.exec(a?.getAttribute('href') ?? '')?.[1] ?? '',
			name: clean(a?.text),
			affiliation: clean(el.querySelector('.gsc_rsb_a_ext')?.text)
		};
	});

	return {
		id,
		name: clean(doc.querySelector('#gsc_prf_in')?.text),
		affiliation,
		emailDomain: emailLine
			.replace(/^Verified email at /i, '')
			.replace(/ - Homepage$/i, '')
			.trim(),
		interests: doc.querySelectorAll('#gsc_prf_int a').map((a) => clean(a.text)),
		hasPhoto: !/avatar_scholar/.test(
			doc.querySelector('#gsc_prf_pup-img')?.getAttribute('src') ?? ''
		),
		metrics: {
			citations: std[0] ?? 0,
			citationsRecent: std[1] ?? 0,
			h: std[2] ?? 0,
			hRecent: std[3] ?? 0,
			i10: std[4] ?? 0,
			i10Recent: std[5] ?? 0,
			recentSince: since
		},
		citesPerYear: citesPerYear.filter((c) => c.year > 0),
		coauthors
	};
}

function parseRows(html: string): { rows: ScholarPub[]; more: boolean } {
	const doc = parse(html);
	const rows = doc.querySelectorAll('tr.gsc_a_tr').flatMap((tr: HTMLElement) => {
		const a = tr.querySelector('.gsc_a_at');
		if (!a) return [];
		const gray = tr.querySelectorAll('.gs_gray').map((g) => clean(g.text));
		const year = num(tr.querySelector('.gsc_a_y')?.text) || null;
		const venue = (gray[1] ?? '').replace(new RegExp(`,?\\s*${year ?? '\\d{4}'}$`), '').trim();
		return [
			{
				title: clean(a.text),
				authors: gray[0] ?? '',
				venue,
				year,
				citations: num(tr.querySelector('.gsc_a_c a')?.text),
				key: /citation_for_view=([\w:-]+)/.exec(a.getAttribute('href') ?? '')?.[1] ?? ''
			}
		];
	});
	const more = doc.querySelector('#gsc_bpf_more')?.getAttribute('disabled') === undefined;
	return { rows, more: more && rows.length === 100 };
}

const profileUrl = (id: string, start = 0) =>
	`${BASE}/citations?user=${id}&hl=en&cstart=${start}&pagesize=100`;

async function readProfile(id: string, allPages: boolean): Promise<ScholarProfile> {
	const first = await cachedFetch(profileUrl(id), { gapMs: GAP });
	const head = parseProfile(id, first);
	let { rows, more } = parseRows(first);
	const publications = [...rows];
	while (allPages && more) {
		({ rows, more } = parseRows(
			await cachedFetch(profileUrl(id, publications.length), { gapMs: GAP })
		));
		publications.push(...rows);
	}
	return { ...head, publications, complete: !more };
}

/* ------------------------------------------------------------------ matching */

const TITLE_WORDS = new Set(['dr', 'prof', 'professor', 'mr', 'ms', 'mrs', 'phd', 'ph', 'd']);
export const COMMON_SURNAMES = new Set(
	'jain sharma verma gupta singh patel kumar agrawal agarwal joshi yadav tiwari mishra shukla soni pandey khan shah choudhary chouhan rathore malviya'.split(
		' '
	)
);

/** How well a Scholar name fits an IIPS name: 2 full first name, 1 initial, 0 surname only, -1 no. */
export function nameFit(iipsName: string, scholarName: string): number {
	const want = nameTokens(iipsName);
	const have = nameTokens(scholarName).filter((t) => !TITLE_WORDS.has(t));
	const surname = want.at(-1)!;
	if (!have.includes(surname)) return -1;
	const firsts = want.slice(0, -1);
	const others = have.filter((t) => t !== surname);
	if (!firsts.length) return 0;
	const first = firsts[0];
	if (first.length > 1 && others.includes(first)) return 2;
	// "B K Tripathi" against "BK Tripathi" or "Bhupendra Kumar Tripathi"
	const initials = others.map((t) => t[0]).join('');
	const joined = others.filter((t) => t.length <= 3).join('');
	const wantInitials = firsts.map((t) => t[0]).join('');
	if (initials.startsWith(wantInitials) || joined.startsWith(wantInitials)) return 1;
	if (others.some((t) => t[0] === first[0])) return 1;
	return 0;
}

/** Does an author list like "PS Tomar, K Mathur, U Suman" contain this person? */
export function authorListHas(authors: string, personName: string): boolean {
	const want = nameTokens(personName);
	const surname = want.at(-1);
	const initial = want[0]?.[0];
	if (!surname || !initial || want.length < 2) return false;
	return authors.split(',').some((a) => {
		const t = nameTokens(a);
		if (!t.includes(surname)) return false;
		const rest = t.filter((x) => x !== surname).join('');
		return rest.startsWith(initial) || rest.includes(initial);
	});
}

const words = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.filter((w) => w.length > 2);

/** A Scholar title also appears in one of the IIPS citation strings. */
export function titleListed(title: string, listed: string[]): boolean {
	const t = words(title);
	if (t.length < 4) return false;
	return listed.some((entry) => {
		const e = new Set(words(entry));
		return t.filter((w) => e.has(w)).length / t.length >= 0.85;
	});
}

const AFFIL_STRONG =
	/\bIIPS\b|International Institute of Professional Studies|Inst(itute)?\.? of Prof(essional)?\.? Studies/i;
const AFFIL_UNI = /\bD\.?A\.?V\.?V\b|Devi Ahilya|DAVV/i;

export function scoreCandidate(
	person: IipsFaculty,
	profile: ScholarProfile,
	everyone: IipsFaculty[]
): Candidate {
	const evidence: Evidence[] = [];
	const add = (kind: Evidence['kind'], points: number, text: string) =>
		evidence.push({ kind, points, text });

	const fit = nameFit(person.name, profile.name);
	if (fit === 2) add('name', 20, `Name matches: ${profile.name}`);
	else if (fit === 1) add('name', 10, `Initials and surname match: ${profile.name}`);
	else add('name', 0, `Only the surname matches: ${profile.name}`);

	if (/(^|\.)iips\.edu\.in$/i.test(profile.emailDomain))
		add('email', 50, `Verified email at ${profile.emailDomain}`);
	else if (/dauniv\.ac\.in$/i.test(profile.emailDomain))
		add('email', 25, `Verified email at ${profile.emailDomain} (DAVV)`);

	if (AFFIL_STRONG.test(profile.affiliation))
		add('affiliation', 40, `Affiliation: ${profile.affiliation}`);
	else if (AFFIL_UNI.test(profile.affiliation))
		add('affiliation', 25, `Affiliation: ${profile.affiliation}`);
	else if (/indore/i.test(profile.affiliation))
		add('affiliation', 10, `Affiliation: ${profile.affiliation}`);

	const listed = [
		...person.listedPublications,
		...(person.sections['Published Papers in Journals'] ?? []).map((r) => r.cells.join(' '))
	];
	const sameTitles = profile.publications.filter((p) => titleListed(p.title, listed));
	if (sameTitles.length)
		add(
			'iips-paper',
			sameTitles.length >= 3 ? 40 : 30,
			`${sameTitles.length} paper(s) also listed on the IIPS site, e.g. "${sameTitles[0].title}"`
		);

	const scholars = (person.sections['Registered Ph.D. Candidates List'] ?? [])
		.map((r) => r.cells[0])
		.filter(Boolean);
	const allAuthors = profile.publications.map((p) => p.authors).join(', ');
	const coStudents = scholars.filter((s) => authorListHas(allAuthors, s));
	if (coStudents.length) {
		const rare = coStudents.filter((s) => !COMMON_SURNAMES.has(nameTokens(s).at(-1)!));
		const points = Math.min(40, rare.length * 25 + (coStudents.length - rare.length) * 8);
		add(
			'phd-coauthor',
			points,
			`Ph.D. scholar(s) as co-author: ${coStudents.map(stripTitle).join(', ')}`
		);
	}

	// A common surname in a long author list proves nothing, so those only count from the
	// co-author box when the co-author is shown at IIPS.
	const colleagues = everyone
		.filter((f) => f.slug !== person.slug)
		.filter(
			(f) =>
				(!COMMON_SURNAMES.has(nameTokens(f.name).at(-1)!) && authorListHas(allAuthors, f.name)) ||
				profile.coauthors.some(
					(c) => nameFit(f.name, c.name) >= 1 && AFFIL_STRONG.test(c.affiliation)
				)
		);
	if (colleagues.length)
		add(
			'colleague',
			Math.min(20, colleagues.length * 8),
			`IIPS colleague(s) as co-author: ${colleagues.map((f) => stripTitle(f.name)).join(', ')}`
		);

	const spec = new Set(words(person.specialization));
	const shared = profile.interests.filter((i) => words(i).some((w) => spec.has(w)));
	if (shared.length) add('interests', 5, `Interests overlap: ${shared.join(', ')}`);

	// At least the first name or initials must fit, and something must tie the profile to
	// IIPS or DAVV: email, affiliation, a paper listed on the IIPS site or a Ph.D. student.
	const points = evidence.reduce((s, e) => s + e.points, 0);
	const ties = evidence.filter(
		(e) => ['email', 'affiliation', 'iips-paper', 'phd-coauthor'].includes(e.kind) && e.points >= 25
	);
	const confidence =
		fit >= 1 && ties.length >= 1 && points >= 70
			? 'high'
			: fit >= 1 && ties.length >= 1
				? 'medium'
				: 'low';
	return {
		id: profile.id,
		name: profile.name,
		affiliation: profile.affiliation,
		emailDomain: profile.emailDomain,
		citations: profile.metrics.citations,
		points,
		confidence,
		evidence
	};
}

/* ------------------------------------------------------------------ search */

function queriesFor(person: IipsFaculty): string[] {
	const name = stripTitle(person.name).replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
	return [`${name} IIPS`, `"${name}"`, `${name} Indore`, `${name} DAVV`];
}

/** Profile ids on a Scholar results page: the "User profiles" box first, then author links. */
function candidatesFrom(html: string, person: IipsFaculty): string[] {
	const doc = parse(html);
	const boxed: string[] = [];
	const linked = new Map<string, number>();
	for (const a of doc.querySelectorAll('a[href*="citations?user="]')) {
		const id = /user=([\w-]+)/.exec(a.getAttribute('href') ?? '')?.[1];
		if (!id) continue;
		const href = a.getAttribute('href') ?? '';
		if (nameFit(person.name, clean(a.text)) < 0) continue;
		if (/oi=ao/.test(href)) {
			if (!boxed.includes(id)) boxed.push(id);
		} else linked.set(id, (linked.get(id) ?? 0) + 1);
	}
	const byUse = [...linked.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
	return [...new Set([...boxed, ...byUse])];
}

async function matchOne(
	person: IipsFaculty,
	everyone: IipsFaculty[],
	override: Override | undefined,
	hints: string[],
	previous?: ScholarMatch,
	search = true
): Promise<ScholarMatch> {
	const queries: string[] = previous ? [...previous.queries] : [];
	const candidates: Candidate[] = [];
	const check = async (id: string) => {
		if (candidates.some((c) => c.id === id)) return;
		candidates.push(scoreCandidate(person, await readProfile(id, false), everyone));
	};
	// ids found some other way (a web search, a colleague's co-author list) are checked the same way
	for (const id of [override?.scholarId, ...hints]) if (id) await check(id);
	for (const c of previous?.candidates ?? []) await check(c.id);
	const good = () => candidates.some((c) => c.confidence !== 'low');

	if (override === undefined && search)
		for (const q of queriesFor(person)) {
			if (good()) break;
			queries.push(q);
			const html = await cachedFetch(`${BASE}/scholar?hl=en&q=${encodeURIComponent(q)}`, {
				gapMs: GAP
			});
			for (const id of candidatesFrom(html, person).slice(0, MAX_CANDIDATES)) await check(id);
		}
	candidates.sort((a, b) => b.points - a.points || b.citations - a.citations);

	let chosen: string | null = null;
	let decidedBy: ScholarMatch['decidedBy'] = 'none';
	let note = '';
	if (override !== undefined) {
		chosen = override.scholarId;
		decidedBy = 'override';
		note = override.note ?? 'Set by hand in overrides.json';
	} else {
		const best = candidates[0];
		const runnerUp = candidates[1];
		if (best && best.confidence !== 'low') {
			chosen = best.id;
			decidedBy = 'evidence';
			if (runnerUp && runnerUp.confidence !== 'low' && best.points - runnerUp.points < 15)
				note = `Close call with ${runnerUp.name} (${runnerUp.id}), please check`;
		} else note = candidates.length ? 'Only weak candidates found' : 'No Scholar profile found';
	}

	const profile = chosen ? await readProfile(chosen, true) : null;
	return { slug: person.slug, queries, candidates, chosen, decidedBy, note, profile };
}

/* ------------------------------------------------------------------ main */

async function main() {
	const rescore = process.argv.includes('--rescore');
	const only = process.argv.slice(2).find((a) => !a.startsWith('--'));
	const { faculty } = readJson<{ faculty: IipsFaculty[] }>(join(OUT, 'iips.json'));
	const overridesFile = join(ROOT, 'scripts', 'data', 'overrides.json');
	const overrides = existsSync(overridesFile)
		? readJson<Record<string, Override>>(overridesFile)
		: {};
	const hintsFile = join(ROOT, 'scripts', 'data', 'hints.json');
	const hints = existsSync(hintsFile) ? readJson<Record<string, string[]>>(hintsFile) : {};
	const outFile = join(OUT, 'scholar.json');
	const results: Record<string, ScholarMatch> = existsSync(outFile) ? readJson(outFile) : {};

	for (const person of faculty) {
		if (only && person.slug !== only) continue;
		try {
			const previous = results[person.slug];
			if (rescore && !previous && !hints[person.slug]) continue;
			const m = await matchOne(
				person,
				faculty,
				overrides[person.slug],
				hints[person.slug] ?? [],
				rescore ? previous : undefined,
				!rescore
			);
			results[person.slug] = m;
			const best = m.candidates.find((c) => c.id === m.chosen);
			console.log(
				`${person.name.padEnd(28)} ${m.chosen ? `${m.chosen} ${best?.confidence ?? 'override'} (${best?.points ?? '-'} pts)` : 'none'}  ${m.profile ? `${m.profile.publications.length} papers, ${m.profile.metrics.citations} cites` : ''} ${m.note}`
			);
		} catch (e) {
			writeJson(outFile, results);
			// a block is expected after about 100 searches: keep what was found and let the
			// next steps run; the rest is picked up from the cache on a later run
			if (e instanceof BlockedError) {
				console.warn(
					`\nStopped at ${person.name}: ${e.message}\nThe rest keeps its earlier result. Run again later (or from another network) to continue.`
				);
				return;
			}
			throw e;
		}
		writeJson(outFile, results);
	}
	console.log(`Wrote scripts/data/out/scholar.json`);
}

if (import.meta.main) await main();

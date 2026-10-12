import { describe, expect, it } from 'vitest';
import rules from '$lib/data/score-rules.json';
import { Faculty } from '$lib/domain/Faculty';
import { hIndex, i10Index, yearIn } from '$lib/domain/metrics';
import { IndexPolicy, curve, type IndexRules } from '$lib/domain/scoring/IndexPolicy';
import type { FacultyRecord, OpenAlexProfile, ScholarPublication } from '$lib/domain/types';

const policy = new IndexPolicy(rules as IndexRules);

function pub(over: Partial<ScholarPublication> = {}): ScholarPublication {
	return {
		title: 'A paper',
		authors: 'K Mathur',
		venue: 'Some Journal 1 (2), 3-4',
		year: 2024,
		citations: 0,
		type: 'journal',
		flag: null,
		key: Math.random().toString(36).slice(2),
		...over
	};
}

function record(over: Partial<FacultyRecord> = {}): FacultyRecord {
	return {
		slug: 'test',
		iipsId: '1',
		name: 'Dr. Test Person',
		department: 'cs',
		order: 0,
		designation: 'Professor',
		qualification: 'Ph.D.',
		specialization: [],
		teachingYears: 20,
		teachingExperience: 'Over 20 Years',
		industryExperience: '',
		emails: [],
		photo: null,
		responsibilities: [],
		memberships: [],
		projects: [],
		workshops: [],
		phd: [],
		iipsPapers: [],
		scholar: null,
		openalex: null,
		scholarSearch: { queries: [], note: '', candidates: [] },
		...over
	};
}

function withScholar(pubs: ScholarPublication[]) {
	return record({
		scholar: {
			id: 'ABCDEFGHIJKL',
			name: 'Test Person',
			affiliation: 'IIPS',
			emailDomain: 'iips.edu.in',
			interests: [],
			match: { confidence: 'high', decidedBy: 'evidence', points: 100, evidence: [], note: '' },
			reported: {
				citations: 0,
				citationsRecent: 0,
				h: 0,
				hRecent: 0,
				i10: 0,
				i10Recent: 0,
				recentSince: 2021
			},
			citesPerYear: [],
			complete: true,
			publications: pubs
		}
	});
}

const openalex = (pubs: ScholarPublication[]): OpenAlexProfile => ({
	ids: ['A1'],
	name: 'Test Person',
	orcid: null,
	match: { confidence: 'high', evidence: [], note: '' },
	publications: pubs
});

const pillar = (f: Faculty, id: string) =>
	policy.score(f.facts(2026, 5)).pillars.find((p) => p.id === id)!;

describe('metrics', () => {
	it('computes the h-index', () => {
		expect(hIndex([10, 8, 5, 4, 3])).toBe(4);
		expect(hIndex([25, 8, 5, 3, 3])).toBe(3);
		expect(hIndex([100])).toBe(1);
		expect(hIndex([0, 0])).toBe(0);
		expect(hIndex([])).toBe(0);
	});

	it('computes the i10-index', () => {
		expect(i10Index([10, 9, 50, 11])).toBe(3);
	});

	it('finds the year in an IIPS citation string', () => {
		expect(yearIn('Thakur, R. (2014). Context-free grammar learning')).toBe(2014);
		expect(yearIn('no year here, volume 106(15)')).toBeNull();
	});
});

describe('Faculty', () => {
	it('uses Google Scholar first, then OpenAlex, then the IIPS website', () => {
		expect(new Faculty(withScholar([pub()])).source).toBe('scholar');
		expect(new Faculty(record({ openalex: openalex([pub()]) })).source).toBe('openalex');
		expect(new Faculty(record()).source).toBe('iips');
	});

	it('leaves flagged papers out of every count', () => {
		const f = new Faculty(
			withScholar([
				pub({ citations: 59, year: 1985, flag: 'before-career' }),
				pub({ citations: 50 }),
				pub({ citations: 20, type: 'conference' }),
				pub({ citations: 5, flag: 'duplicate' })
			])
		);
		const facts = f.facts(2026, 5);
		expect(facts).toMatchObject({ papers: 2, citations: 70, h: 2, setAside: 2, source: 'scholar' });
		expect(facts.byType).toMatchObject({ journal: 1, conference: 1 });
	});

	it('counts recent work and active years inside the window only', () => {
		const f = new Faculty(
			withScholar([
				pub({ year: 2022 }),
				pub({ year: 2022 }),
				pub({ year: 2021 }),
				pub({ year: 2026 }),
				pub({ year: null })
			])
		);
		const facts = f.facts(2026, 5);
		expect(facts.recentByType.journal).toBe(3);
		expect(facts.activeYears).toBe(2);
	});

	it('falls back to the IIPS list without any research profile', () => {
		const f = new Faculty(
			record({
				iipsPapers: [
					{ text: 'A, B (2023) Title one, Journal', link: null },
					{ text: 'A (2012) Title two, Journal', link: null }
				],
				phd: [
					{ name: 'Ms. X', topic: '', status: 'awarded' },
					{ name: 'Mr. Y', topic: '', status: 'ongoing' },
					{ name: 'Mr. Z', topic: '', status: 'submitted' }
				]
			})
		);
		expect(f.facts(2026, 5)).toMatchObject({
			papers: 2,
			citations: 0,
			activeYears: 1,
			phdAwarded: 1,
			phdOngoing: 2,
			source: 'iips'
		});
	});

	it('makes initials without the title', () => {
		expect(new Faculty(record({ name: 'Dr. Pradeep K. Jatav' })).initials).toBe('PJ');
	});
});

describe('IndexPolicy', () => {
	it('uses a square root curve: a quarter of the target earns half the points', () => {
		expect(curve(0, 60, 20)).toBe(0);
		expect(curve(15, 60, 20)).toBeCloseTo(10);
		expect(curve(60, 60, 20)).toBe(20);
		expect(curve(600, 60, 20)).toBe(20);
	});

	it('has five pillars of 20 points', () => {
		const sheet = policy.score(new Faculty(withScholar([pub()])).facts(2026, 5));
		expect(sheet.pillars.map((p) => p.max)).toEqual([20, 20, 20, 20, 20]);
		expect(sheet.max).toBe(100);
	});

	it('weights paper types for output', () => {
		const f = new Faculty(
			withScholar([
				pub({ type: 'journal' }),
				pub({ type: 'book' }),
				pub({ type: 'conference' }),
				pub({ type: 'thesis' })
			])
		);
		expect(pillar(f, 'output').parts[0].value).toBe(1 + 2 + 0.5 + 0);
	});

	it('averages citations over at least three papers', () => {
		const f = new Faculty(withScholar([pub({ citations: 90 })]));
		expect(pillar(f, 'quality').parts[0].value).toBe(30);
	});

	it('rewards quality over volume', () => {
		const few = new Faculty(withScholar(Array.from({ length: 5 }, () => pub({ citations: 40 }))));
		const many = new Faculty(withScholar(Array.from({ length: 40 }, () => pub({ citations: 1 }))));
		expect(pillar(few, 'quality').points).toBeGreaterThan(pillar(many, 'quality').points);
		expect(pillar(many, 'output').points).toBeGreaterThan(pillar(few, 'output').points);
	});

	it('gives full points at every target', () => {
		const f = new Faculty(
			record({
				scholar: withScholar(
					Array.from({ length: 60 }, (_, i) => pub({ citations: 20, year: 2022 + (i % 5) }))
				).scholar,
				phd: Array.from({ length: 8 }, () => ({ name: 'X', topic: '', status: 'awarded' as const }))
			})
		);
		const sheet = policy.score(f.facts(2026, 5));
		expect(sheet.pillars.find((p) => p.id === 'mentoring')!.parts[0].points).toBe(14);
		expect(sheet.pillars.slice(0, 4).every((p) => p.points === 20)).toBe(true);
	});

	it('counts ongoing Ph.D. scholars at half weight', () => {
		const f = new Faculty(
			record({
				phd: [
					{ name: 'A', topic: '', status: 'awarded' },
					{ name: 'B', topic: '', status: 'ongoing' }
				]
			})
		);
		expect(pillar(f, 'mentoring').parts[0].value).toBe(1.5);
	});

	it('maps totals to grades at the band edges', () => {
		expect(policy.gradeOf(100)).toBe('A+');
		expect(policy.gradeOf(75)).toBe('A+');
		expect(policy.gradeOf(74)).toBe('A');
		expect(policy.gradeOf(30)).toBe('B');
		expect(policy.gradeOf(0)).toBe('D');
	});

	it('marks a sheet without a research profile as partial, but not an OpenAlex one', () => {
		expect(policy.score(new Faculty(record()).facts(2026, 5)).partial).toBe(true);
		const oa = new Faculty(record({ openalex: openalex([pub({ citations: 3 })]) }));
		expect(policy.score(oa.facts(2026, 5)).partial).toBe(false);
	});

	it('has parts that add up to each pillar and grades from high to low', () => {
		const r = rules as IndexRules;
		for (const p of r.pillars) expect(p.parts.reduce((s, x) => s + x.max, 0)).toBe(20);
		for (let i = 1; i < r.grades.length; i++)
			expect(r.grades[i].min).toBeLessThan(r.grades[i - 1].min);
	});
});

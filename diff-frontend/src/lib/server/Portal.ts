import { Faculty, type ResearchFacts } from '$lib/domain/Faculty';
import type { IndexRules } from '$lib/domain/scoring/IndexPolicy';
import type { ScoreSheet, ScoringPolicy } from '$lib/domain/scoring/ScoringPolicy';
import {
	paperUrl,
	type Confidence,
	type DepartmentId,
	type FacultyRecord,
	type PortalData,
	type ScholarPublication,
	type Source
} from '$lib/domain/types';

/** One card in the directory or one row in the scores table. */
export interface FacultySummary {
	slug: string;
	name: string;
	initials: string;
	designation: string;
	department: DepartmentId;
	order: number;
	photo: string | null;
	specialization: string[];
	source: Source;
	confidence: Confidence | null;
	papers: number;
	citations: number;
	h: number;
	phdAwarded: number;
	total: number;
	grade: string;
	partial: boolean;
	/** Points of each pillar, in rule order. */
	points: number[];
}

export interface RecentPaper extends ScholarPublication {
	slug: string;
	facultyName: string;
	url: string;
}

const median = (xs: number[]) => {
	const s = [...xs].sort((a, b) => a - b);
	const m = Math.floor(s.length / 2);
	return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0;
};

/**
 * Repository over the static data file. Built once at build time; every page reads from it
 * and only receives the slice it shows.
 */
export class Portal {
	readonly faculty: Faculty[];
	readonly year: number;
	private readonly sheets = new Map<string, { facts: ResearchFacts; sheet: ScoreSheet }>();

	constructor(
		readonly data: PortalData,
		readonly policy: ScoringPolicy,
		readonly rules: IndexRules
	) {
		this.faculty = data.faculty.map((r) => new Faculty(r));
		this.year = Number(data.updated.slice(0, 4));
		for (const f of this.faculty) {
			const facts = f.facts(this.year, rules.recentYears);
			this.sheets.set(f.slug, { facts, sheet: policy.score(facts) });
		}
	}

	get departments() {
		return this.data.departments;
	}

	find(slug: string): Faculty | undefined {
		return this.faculty.find((f) => f.slug === slug);
	}

	scoreOf(slug: string) {
		const s = this.sheets.get(slug);
		if (!s) throw new Error(`unknown faculty ${slug}`);
		return s;
	}

	summary(f: Faculty): FacultySummary {
		const r: FacultyRecord = f.record;
		const { facts, sheet } = this.scoreOf(f.slug);
		return {
			slug: r.slug,
			name: r.name,
			initials: f.initials,
			designation: r.designation,
			department: r.department,
			order: r.order,
			photo: r.photo,
			specialization: r.specialization,
			source: f.source,
			confidence: (r.scholar ?? r.openalex)?.match.confidence ?? null,
			papers: facts.papers,
			citations: facts.citations,
			h: facts.h,
			phdAwarded: facts.phdAwarded,
			total: sheet.total,
			grade: sheet.grade,
			partial: sheet.partial,
			points: sheet.pillars.map((p) => p.points)
		};
	}

	summaries(): FacultySummary[] {
		return this.faculty.map((f) => this.summary(f));
	}

	/** Graded people first by score (ties: more citations, then IIPS order), then the partial ones. */
	ranked(): FacultySummary[] {
		return this.summaries().sort(
			(a, b) =>
				Number(a.partial) - Number(b.partial) ||
				b.total - a.total ||
				b.citations - a.citations ||
				a.order - b.order
		);
	}

	rankOf(slug: string): number {
		return this.ranked().findIndex((s) => s.slug === slug) + 1;
	}

	/** Share of graded faculty with a lower score, 0 to 100. Null for partial records. */
	percentileOf(slug: string): number | null {
		const me = this.scoreOf(slug).sheet;
		if (me.partial) return null;
		const graded = this.summaries().filter((s) => !s.partial);
		const below = graded.filter((s) => s.total < me.total).length;
		return Math.round((below / Math.max(1, graded.length - 1)) * 100);
	}

	/** Median points of each pillar over graded faculty, to compare one person with. */
	pillarMedians(): number[] {
		const graded = this.faculty.map((f) => this.scoreOf(f.slug).sheet).filter((s) => !s.partial);
		return this.rules.pillars.map((_, i) => median(graded.map((s) => s.pillars[i].points)));
	}

	totals() {
		const all = this.faculty.map((f) => this.scoreOf(f.slug).facts);
		const sum = (pick: (x: ResearchFacts) => number) => all.reduce((s, x) => s + pick(x), 0);
		return {
			faculty: this.faculty.length,
			withScholar: this.faculty.filter((f) => f.source === 'scholar').length,
			withOpenAlex: this.faculty.filter((f) => f.source === 'openalex').length,
			papers: sum((x) => x.papers),
			citations: sum((x) => x.citations),
			phdAwarded: sum((x) => x.phdAwarded),
			phdOngoing: sum((x) => x.phdOngoing),
			patents: sum((x) => x.byType.patent)
		};
	}

	/** Newest counted papers across everyone, for the home page. */
	recentPapers(limit: number): RecentPaper[] {
		return this.faculty
			.flatMap((f) =>
				f.counted().map((p) => ({
					...p,
					slug: f.slug,
					facultyName: f.name,
					url: paperUrl(f.source, f.record, p)
				}))
			)
			.filter((p) => p.year !== null && p.year <= this.year && p.type !== 'thesis')
			.sort((a, b) => b.year! - a.year! || b.citations - a.citations)
			.slice(0, limit);
	}

	/** Research areas named by most people, from IIPS specializations. */
	topAreas(limit: number): { area: string; count: number }[] {
		const counts = new Map<string, { area: string; count: number }>();
		for (const f of this.faculty)
			for (const s of f.record.specialization) {
				const key = s.toLowerCase();
				const hit = counts.get(key) ?? { area: s, count: 0 };
				hit.count++;
				counts.set(key, hit);
			}
		return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
	}
}

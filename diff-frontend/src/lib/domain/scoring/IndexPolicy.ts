import type { ResearchFacts } from '../Faculty';
import type { PubType } from '../types';
import type { ScorePart, ScoreSheet, ScoringPolicy } from './ScoringPolicy';

export const METRICS = [
	'weightedPapers',
	'citations',
	'h',
	'citesPerPaper',
	'i10',
	'recentWeighted',
	'activeYears',
	'phd',
	'patentsBooks'
] as const;
export type Metric = (typeof METRICS)[number];

export interface IndexRules {
	name: string;
	/** Length of the "recent work" window in years. */
	recentYears: number;
	/** Value of one publication of each type, a journal paper being 1. */
	weights: Record<PubType, number>;
	/** A Ph.D. that is still running counts as this share of an awarded one. */
	phdOngoingShare: number;
	/** Citations per paper are averaged over at least this many papers. */
	minPapersForAverage: number;
	pillars: {
		id: string;
		label: string;
		about: string;
		parts: { metric: Metric; label: string; max: number; target: number }[];
	}[];
	/** Grades from the highest down: a total of `min` or more earns the grade. */
	grades: { grade: string; min: number }[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Points on a square root curve: reaching the target earns all the points, and on the way
 * every bit counts, the first ones most. A quarter of the target earns half the points.
 */
export function curve(value: number, target: number, max: number): number {
	if (value <= 0 || target <= 0) return 0;
	return max * Math.min(1, Math.sqrt(value / target));
}

/** IIPS Research Index: five pillars of 20 points, each from one or two measures. */
export class IndexPolicy implements ScoringPolicy {
	readonly name: string;

	constructor(readonly rules: IndexRules) {
		this.name = rules.name;
	}

	private weighted(byType: Record<PubType, number>): number {
		let sum = 0;
		for (const [type, n] of Object.entries(byType))
			sum += n * (this.rules.weights[type as PubType] ?? 0);
		return round1(sum);
	}

	measure(metric: Metric, f: ResearchFacts): number {
		switch (metric) {
			case 'weightedPapers':
				return this.weighted(f.byType);
			case 'citations':
				return f.citations;
			case 'h':
				return f.h;
			case 'citesPerPaper':
				return round1(f.citations / Math.max(f.papers, this.rules.minPapersForAverage));
			case 'i10':
				return f.i10;
			case 'recentWeighted':
				return this.weighted(f.recentByType);
			case 'activeYears':
				return f.activeYears;
			case 'phd':
				return f.phdAwarded + f.phdOngoing * this.rules.phdOngoingShare;
			case 'patentsBooks':
				return f.byType.patent + f.byType.book;
		}
	}

	score(facts: ResearchFacts): ScoreSheet {
		let exact = 0;
		const pillars = this.rules.pillars.map((p) => {
			const parts: ScorePart[] = p.parts.map((part) => {
				const value = this.measure(part.metric, facts);
				const points = curve(value, part.target, part.max);
				exact += points;
				return { ...part, value, points: round1(points) };
			});
			return {
				id: p.id,
				label: p.label,
				about: p.about,
				points: round1(parts.reduce((s, x) => s + x.points, 0)),
				max: parts.reduce((s, x) => s + x.max, 0),
				parts
			};
		});
		const total = Math.round(exact);
		return {
			policy: this.name,
			total,
			max: pillars.reduce((s, p) => s + p.max, 0),
			grade: this.gradeOf(total),
			pillars,
			partial: facts.source === 'iips',
			source: facts.source
		};
	}

	gradeOf(total: number): string {
		return this.rules.grades.find((g) => total >= g.min)?.grade ?? this.rules.grades.at(-1)!.grade;
	}
}

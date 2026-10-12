import type { ResearchFacts } from '../Faculty';
import type { Source } from '../types';

export interface ScorePart {
	metric: string;
	label: string;
	/** The measured value, e.g. 27.5 weighted papers. */
	value: number;
	/** The value that earns full points. */
	target: number;
	points: number;
	max: number;
}

export interface ScorePillar {
	id: string;
	label: string;
	/** One line on what the pillar measures. */
	about: string;
	points: number;
	max: number;
	parts: ScorePart[];
}

export interface ScoreSheet {
	policy: string;
	total: number;
	max: number;
	grade: string;
	pillars: ScorePillar[];
	/** True when there is no research profile, so citations are unknown and no grade is given. */
	partial: boolean;
	source: Source;
}

/**
 * Strategy: one implementation per rule set. Pages only use this interface, so the
 * rules can change (or a second rule set can be added) without touching them.
 */
export interface ScoringPolicy {
	readonly name: string;
	score(facts: ResearchFacts): ScoreSheet;
	gradeOf(total: number): string;
}

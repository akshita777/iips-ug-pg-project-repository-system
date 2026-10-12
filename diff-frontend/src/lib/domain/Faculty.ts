import { hIndex, i10Index, yearIn } from './metrics';
import {
	PUB_TYPES,
	type FacultyRecord,
	type PubType,
	type ScholarPublication,
	type Source
} from './types';

/** The counted numbers a score is built from. */
export interface ResearchFacts {
	/** Counted publications of each type, whole career. */
	byType: Record<PubType, number>;
	/** Counted publications of each type in the recent window. */
	recentByType: Record<PubType, number>;
	papers: number;
	citations: number;
	h: number;
	i10: number;
	/** Years in the recent window with at least one counted paper. */
	activeYears: number;
	phdAwarded: number;
	/** Running or thesis submitted. */
	phdOngoing: number;
	/** Entries of the source left out of the counts. */
	setAside: number;
	source: Source;
}

const TITLE = /^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i;
const zero = () => Object.fromEntries(PUB_TYPES.map((t) => [t, 0])) as Record<PubType, number>;

export class Faculty {
	constructor(readonly record: FacultyRecord) {}

	get slug() {
		return this.record.slug;
	}

	get name() {
		return this.record.name;
	}

	/** "Dr. Pradeep K. Jatav" gives "PJ". */
	get initials(): string {
		const words = this.name.replace(TITLE, '').split(/\s+/);
		return ((words[0]?.[0] ?? '') + (words.at(-1)?.[0] ?? '')).toUpperCase();
	}

	/** Google Scholar when there is a profile, else OpenAlex, else the IIPS website. */
	get source(): Source {
		return this.record.scholar ? 'scholar' : this.record.openalex ? 'openalex' : 'iips';
	}

	/** Every paper of the source, counted or not. */
	publications(): ScholarPublication[] {
		return (this.record.scholar ?? this.record.openalex)?.publications ?? [];
	}

	/** Papers that are really this person's (flagged ones are left out). */
	counted(): ScholarPublication[] {
		return this.publications().filter((p) => !p.flag);
	}

	/**
	 * Numbers for scoring, from the cleaned paper list of the best source. Without any research
	 * profile, the papers listed on the IIPS site count as journal papers with no citations.
	 * @param year the year the data describes
	 * @param recentYears size of the recent window, e.g. 5 means year - 4 to year
	 */
	facts(year: number, recentYears: number): ResearchFacts {
		const from = year - recentYears + 1;
		const inWindow = (y: number | null) => y !== null && y >= from && y <= year;
		const phd = this.record.phd;
		const base = {
			phdAwarded: phd.filter((p) => p.status === 'awarded').length,
			phdOngoing: phd.filter((p) => p.status !== 'awarded').length
		};
		const byType = zero();
		const recentByType = zero();

		if (this.source !== 'iips') {
			const counted = this.counted();
			for (const p of counted) {
				byType[p.type]++;
				if (inWindow(p.year)) recentByType[p.type]++;
			}
			const cites = counted.map((p) => p.citations);
			const years = new Set(counted.filter((p) => inWindow(p.year)).map((p) => p.year));
			return {
				...base,
				byType,
				recentByType,
				papers: counted.length,
				citations: cites.reduce((a, b) => a + b, 0),
				h: hIndex(cites),
				i10: i10Index(cites),
				activeYears: years.size,
				setAside: this.publications().length - counted.length,
				source: this.source
			};
		}

		const papers = this.record.iipsPapers;
		const yearsOf = papers.map((p) => yearIn(p.text));
		byType.journal = papers.length;
		recentByType.journal = yearsOf.filter(inWindow).length;
		return {
			...base,
			byType,
			recentByType,
			papers: papers.length,
			citations: 0,
			h: 0,
			i10: 0,
			activeYears: new Set(yearsOf.filter(inWindow)).size,
			setAside: 0,
			source: 'iips'
		};
	}
}

/** Shapes of src/lib/data/faculty.json, written by scripts/data/build.ts. */

export type DepartmentId = 'cs' | 'mgmt';

export const PUB_TYPES = [
	'journal',
	'conference',
	'book',
	'chapter',
	'patent',
	'thesis',
	'other'
] as const;
export type PubType = (typeof PUB_TYPES)[number];
export const PUB_TYPE_LABELS: Record<PubType, string> = {
	journal: 'Journal',
	conference: 'Conference',
	book: 'Book',
	chapter: 'Chapter',
	patent: 'Patent',
	thesis: 'Thesis',
	other: 'Other'
};

/** Why a paper is not counted. */
export type PubFlag =
	'before-career' | 'not-author' | 'duplicate' | 'manual' | 'other-field' | 'unconfirmed';
export const FLAG_LABELS: Record<PubFlag, string> = {
	'before-career': 'Dated before this person started working, likely a namesake',
	'not-author': 'Author list does not include this person',
	duplicate: 'Same paper listed twice',
	manual: 'Removed after a check by hand',
	'other-field': 'Different subject and no IIPS link, likely a namesake',
	unconfirmed: 'Nothing on the paper links this person to IIPS or DAVV'
};

/** Where a person's paper list comes from, best first. */
export type Source = 'scholar' | 'openalex' | 'iips';
export const SOURCE_LABELS: Record<Source, string> = {
	scholar: 'Google Scholar',
	openalex: 'OpenAlex',
	iips: 'IIPS website'
};

export type Confidence = 'high' | 'medium' | 'low';

export interface Department {
	id: DepartmentId;
	name: string;
	short: string;
}

export interface ScholarPublication {
	title: string;
	authors: string;
	venue: string;
	year: number | null;
	citations: number;
	type: PubType;
	flag: PubFlag | null;
	/** Reason, for papers removed by hand. */
	note?: string;
	/** Scholar's id for the paper inside the profile, or the OpenAlex work id. */
	key: string;
	doi?: string;
}

export interface ScholarMetrics {
	citations: number;
	citationsRecent: number;
	h: number;
	hRecent: number;
	i10: number;
	i10Recent: number;
	recentSince: number;
}

export interface ScholarProfile {
	id: string;
	name: string;
	affiliation: string;
	emailDomain: string;
	interests: string[];
	match: {
		confidence: Confidence;
		decidedBy: 'evidence' | 'override' | 'none';
		points: number | null;
		evidence: string[];
		note: string;
	};
	/** Totals exactly as Google Scholar shows them. */
	reported: ScholarMetrics;
	citesPerYear: { year: number; count: number }[];
	complete: boolean;
	publications: ScholarPublication[];
}

/** A person in OpenAlex, the open research database; may merge several OpenAlex records. */
export interface OpenAlexProfile {
	ids: string[];
	name: string;
	orcid: string | null;
	match: { confidence: Confidence; evidence: string[]; note: string };
	publications: ScholarPublication[];
}

export type PhdStatus = 'awarded' | 'submitted' | 'ongoing';

export interface FacultyRecord {
	slug: string;
	iipsId: string;
	name: string;
	department: DepartmentId;
	/** Position in the IIPS list, which follows seniority. */
	order: number;
	designation: string;
	qualification: string;
	specialization: string[];
	teachingYears: number | null;
	teachingExperience: string;
	industryExperience: string;
	emails: string[];
	photo: string | null;
	responsibilities: string[];
	memberships: string[];
	projects: { title: string; agency: string; status: string }[];
	workshops: string[];
	phd: { name: string; topic: string; status: PhdStatus }[];
	iipsPapers: { text: string; link: string | null }[];
	scholar: ScholarProfile | null;
	openalex: OpenAlexProfile | null;
	scholarSearch: {
		queries: string[];
		note: string;
		candidates: { id: string; name: string; affiliation: string; confidence: Confidence }[];
	};
}

export interface PortalData {
	version: number;
	updated: string;
	sources: { iips: string; iipsFetched: string; scholar: string; openalex: string };
	departments: Department[];
	faculty: FacultyRecord[];
}

export const scholarUrl = (id: string) => `https://scholar.google.com/citations?user=${id}&hl=en`;
export const scholarPaperUrl = (profileId: string, key: string) =>
	`https://scholar.google.com/citations?view_op=view_citation&hl=en&user=${profileId}&citation_for_view=${key}`;
/** "Dr. S.C. Patidar" gives "S C Patidar": the name as it appears on papers. */
export const plainName = (name: string) =>
	name
		.replace(/^\s*(dr|prof|mr|ms|mrs)\.?\s+/i, '')
		.replace(/\./g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

/** Plain name only: Scholar then shows matching profiles at the top of the results. */
export const scholarSearchUrl = (name: string) =>
	`https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(plainName(name))}`;
export const IIPS_PROFILE_URL = 'https://iips.edu.in/faculty_profile.php';
export const openalexUrl = (id: string) => `https://openalex.org/${id}`;

/** Where a paper can be read: Scholar's page for it, else its DOI, else its OpenAlex page. */
export function paperUrl(source: Source, record: FacultyRecord, p: ScholarPublication): string {
	if (source === 'scholar' && record.scholar) return scholarPaperUrl(record.scholar.id, p.key);
	return p.doi ?? openalexUrl(p.key);
}

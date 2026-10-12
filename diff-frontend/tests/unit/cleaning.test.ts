/** The data scripts' matching and cleaning rules, with real cases met while building the data. */
import { describe, expect, it } from 'vitest';
import { classify, cleanPublications, mentions, sameTitle } from '../../scripts/data/build.ts';
import { decodeMixed } from '../../scripts/data/lib.ts';
import { scoreAuthor, tieWorks, type OpenAlexWork } from '../../scripts/data/openalex.ts';
import {
	authorListHas,
	nameFit,
	scoreCandidate,
	titleListed,
	type ScholarProfile
} from '../../scripts/data/scholar.ts';
import type { IipsFaculty } from '../../scripts/data/iips.ts';

describe('classify', () => {
	it.each([
		['International Journal of Information Technology 16 (3), 1397-1405', 'journal'],
		['Knowledge and Information Systems 66 (8), 4667-4683', 'journal'],
		['Cognitive Systems Research 77, 94-109', 'journal'],
		['2024 11th International Conference on Computing for Sustainable Global ...', 'conference'],
		['IEEEI CCCC-2015 at MITM Indore', 'conference'],
		['Data Engineering and Communication Technology: Proceedings of 3rd ICDECT', 'conference'],
		['Lambert Academic Publishing LAP ISBN-13:978-3-330-33155-6', 'book'],
		['Hidden Link Prediction in Stochastic Social Networks, 50-63', 'chapter'],
		['IN Patent App. 202121012345', 'patent'],
		['Devi Ahilya Vishwavidyalaya, Indore (Ph.D. thesis)', 'thesis'],
		['', 'other']
	])('%s is a %s', (venue, type) => {
		expect(classify(venue)).toBe(type);
	});
});

describe('mentions (loose author check)', () => {
	it('accepts the forms seen on IIPS Scholar profiles', () => {
		expect(mentions('C Purvi, P Shaligram, K Berwal', 'Dr. Shaligram Prajapat')).toBe(true);
		expect(mentions('SP Nitin Naik, Paul Jenkins', 'Dr. Shaligram Prajapat')).toBe(true);
		expect(mentions('V Shrivastava, Y Sheikh', 'Dr. Yasmin Shaikh')).toBe(true);
		expect(mentions('RSSJ Pradeep Jatav', 'Dr. Rahul Singhai')).toBe(true);
	});

	it('rejects a list with no trace of the person', () => {
		expect(mentions('S Dubey', 'Dr. Kirti Mathur')).toBe(false);
	});
});

describe('cleanPublications', () => {
	const base = { venue: 'J 1 (1), 1-2', citations: 0, key: '' };
	it('flags namesake papers from before the career, repeats and non author entries', () => {
		const out = cleanPublications(
			[
				{
					...base,
					key: 'a',
					title: 'Japanese encephalitis virus infection',
					authors: 'A Mathur, KR Mathur',
					year: 1985,
					citations: 59
				},
				{
					...base,
					key: 'b',
					title: 'Sentiment analysis with LSTM',
					authors: 'J Soni, K Mathur',
					year: 2022,
					citations: 29
				},
				{
					...base,
					key: 'c',
					title: 'Sentiment Analysis with LSTM',
					authors: 'J Soni, K Mathur',
					year: 2022,
					citations: 2
				},
				{ ...base, key: 'd', title: 'Cost optimisation in OAuth', authors: 'S Dubey', year: 2017 },
				{ ...base, key: 'e', title: 'Big survey', authors: 'A B, C D, E F, G H, ...', year: 2017 }
			],
			['Dr. Kirti Mathur'],
			2000
		);
		expect(out.map((p) => p.flag)).toEqual([
			'before-career',
			null,
			'duplicate',
			'not-author',
			null
		]);
	});

	it('treats a cut off copy of a title as the same paper', () => {
		const w = (t: string) => t.toLowerCase().split(' ');
		const full = w(
			'Secure and Energy Efficient Inference Optimisation for Consumer GPUs in Edge Computing'
		);
		expect(
			sameTitle(w('Secure and Energy Efficient Inference Optimisation for Consumer GPUs'), full)
		).toBe(true);
		expect(sameTitle(w('Secure and energy'), full)).toBe(false);
		expect(
			sameTitle(w('Part one of a long study series'), w('Part two of a long study series'))
		).toBe(false);
	});

	it('keeps an early dated paper shared with a Ph.D. scholar and drops the impossible year', () => {
		const [p] = cleanPublications(
			[
				{
					...base,
					title: 'Taxonomy in Indian financial structure',
					authors: 'Y Karmarkar, MM Karamchandani, MD Mehta',
					year: 1930
				}
			],
			['Dr. Yamini Karmarkar'],
			2004,
			['Ms. Muskan Karamchandani']
		);
		expect(p.flag).toBeNull();
		expect(p.year).toBeNull();
	});
});

describe('Scholar matching', () => {
	it('fits names, initials and nothing else', () => {
		expect(nameFit('Dr. Kirti Mathur', 'Kirti Mathur')).toBe(2);
		expect(nameFit('Dr. B. K. Tripathi', 'BK Tripathi')).toBe(1);
		expect(nameFit('Ms. Shraddha Soni', 'Priyanshi Soni')).toBe(0);
		expect(nameFit('Dr. Kirti Mathur', 'Kirti Sharma')).toBe(-1);
	});

	it('finds a person in a Scholar author list', () => {
		expect(authorListHas('PS Tomar, K Mathur, U Suman', 'Ms. Pragya Tomar')).toBe(true);
		expect(authorListHas('PS Tomar, K Mathur, U Suman', 'Mr. Jitendra Soni')).toBe(false);
	});

	it('matches a title against IIPS citation strings', () => {
		const listed = [
			'Thakur, R. (2014). Context-free grammar learning from text document using sequential pattern. IJCA, 106(15).'
		];
		expect(
			titleListed(
				'Context-free grammar learning from text document using sequential pattern',
				listed
			)
		).toBe(true);
		expect(titleListed('Deep learning for crop disease', listed)).toBe(false);
	});

	const person = (name: string, extra: Partial<IipsFaculty> = {}): IipsFaculty => ({
		iipsId: '1',
		slug: name.toLowerCase().replace(/\W+/g, '-'),
		name,
		department: 'mgmt',
		order: 0,
		photo: null,
		photoUrl: null,
		qualification: '',
		designation: 'Professor',
		specialization: '',
		industryExperience: '',
		teachingExperience: '',
		phone: '',
		email: '',
		responsibility: '',
		sections: {},
		listedPublications: [],
		...extra
	});
	const profile = (over: Partial<ScholarProfile>): ScholarProfile => ({
		id: 'X',
		name: '',
		affiliation: '',
		emailDomain: '',
		interests: [],
		hasPhoto: false,
		metrics: {
			citations: 0,
			citationsRecent: 0,
			h: 0,
			hRecent: 0,
			i10: 0,
			i10Recent: 0,
			recentSince: 2021
		},
		citesPerYear: [],
		coauthors: [],
		publications: [],
		complete: true,
		...over
	});

	it('rejects a same name profile with no tie to IIPS, even with common surname co-authors', () => {
		const everyone = [
			person('Dr. Preeti Singh'),
			person('Mr. Rajesh Verma'),
			person('Dr. Geeta Sharma')
		];
		const c = scoreCandidate(
			everyone[0],
			profile({
				name: 'Preeti Singh',
				affiliation: 'Lady Hardinge Medical College, New Delhi',
				emailDomain: 'lhmc-hosp.gov.in',
				publications: [
					{
						title: 'Thyroid study',
						authors: 'P Singh, R Verma, G Sharma',
						venue: '',
						year: 2026,
						citations: 3,
						key: ''
					}
				]
			}),
			everyone
		);
		expect(c.confidence).toBe('low');
	});

	it('rejects a surname only match even at IIPS', () => {
		const shraddha = person('Ms. Shraddha Soni');
		const c = scoreCandidate(
			shraddha,
			profile({
				name: 'Priyanshi Soni',
				affiliation: 'International Institute of Professional Studies',
				emailDomain: 'iips.edu.in'
			}),
			[shraddha]
		);
		expect(c.confidence).toBe('low');
	});

	it('accepts a profile with a verified IIPS email', () => {
		const kirti = person('Dr. Kirti Mathur');
		const c = scoreCandidate(
			kirti,
			profile({ name: 'Kirti Mathur', affiliation: 'IIPS DAVV', emailDomain: 'iips.edu.in' }),
			[kirti]
		);
		expect(c.confidence).toBe('high');
	});
});

describe('decodeMixed', () => {
	it('reads UTF-8 and stray Windows-1252 bytes in one page', () => {
		const bytes = Uint8Array.from([0x41, 0x96, 0x42, 0xc3, 0xa9]); // A, cp1252 en dash, B, UTF-8 \u00e9
		expect(decodeMixed(bytes)).toBe('A\u2013B\u00e9');
	});
});

describe('OpenAlex matching', () => {
	const person = (name: string): IipsFaculty => ({
		iipsId: '1',
		slug: name.toLowerCase().replace(/\W+/g, '-'),
		name,
		department: 'cs',
		order: 0,
		photo: null,
		photoUrl: null,
		qualification: '',
		designation: 'Professor',
		specialization: '',
		industryExperience: '',
		teachingExperience: '',
		phone: '',
		email: '',
		responsibility: '',
		sections: {},
		listedPublications: []
	});
	const work = (over: Partial<OpenAlexWork>): OpenAlexWork => ({
		key: Math.random().toString(36).slice(2),
		title: 'A paper',
		authors: 'R Verma',
		venue: '',
		year: 2015,
		citations: 0,
		type: 'journal',
		field: 'Computer Science',
		iips: false,
		davv: false,
		doi: null,
		flag: null,
		...over
	});

	it('rejects a record mixing namesakes from other subjects', () => {
		const rajesh = person('Mr. Rajesh Verma');
		const works = [
			work({ iips: true }),
			...Array.from({ length: 5 }, () => work({ field: 'Materials Science' })),
			...Array.from({ length: 5 }, () => work({}))
		];
		expect(scoreAuthor(rajesh, 'Rajesh Verma', works, [rajesh], 1).confidence).toBe('low');
	});

	it('accepts a record with IIPS printed on its papers', () => {
		const shilpa = person('Dr. Shilpa Bagdare');
		const works = Array.from({ length: 4 }, () =>
			work({ iips: true, field: 'Business, Management and Accounting' })
		);
		expect(scoreAuthor(shilpa, 'Shilpa Bagdare', works, [shilpa], 1).confidence).toBe('high');
	});

	it('counts untied papers only for a rare name, and never in other subjects', () => {
		const works = [work({}), work({ field: 'Chemistry' }), work({ davv: true })];
		const rare = tieWorks(works, person('Dr. Nirmala Sawan'), [], true).map((w) => w.flag);
		const common = tieWorks(works, person('Dr. Pooja Jain'), [], false).map((w) => w.flag);
		expect(rare).toEqual([null, 'other-field', null]);
		expect(common).toEqual(['unconfirmed', 'other-field', null]);
	});
});

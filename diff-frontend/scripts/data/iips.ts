/**
 * Step 1: reads every faculty profile from the IIPS website.
 *
 *   node scripts/data/iips.ts
 *
 * Writes scripts/data/out/iips.json and the photos, cropped to 360 x 432, to
 * static/faculty/<slug>.jpg.
 */
import { parse, type HTMLElement } from 'node-html-parser';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import {
	CACHE,
	OUT,
	PORTAL,
	cachedDownload,
	cachedFetch,
	clean,
	slugify,
	writeJson
} from './lib.ts';

const SITE = 'https://iips.edu.in/';
const LIST_URL = SITE + 'faculty_profile.php';
const DETAIL_URL = SITE + 'faculty_detail.php';
const PUBS_URL = SITE + 'faculty_publication.php';

export interface IipsRow {
	/** The table cells of one row, without the serial number. */
	cells: string[];
	/** First link in the row, if any. */
	link: string | null;
}

export interface IipsFaculty {
	iipsId: string;
	slug: string;
	name: string;
	department: 'cs' | 'mgmt';
	/** Position in the IIPS list (the site orders by seniority). */
	order: number;
	photo: string | null;
	photoUrl: string | null;
	qualification: string;
	designation: string;
	specialization: string;
	industryExperience: string;
	teachingExperience: string;
	phone: string;
	email: string;
	responsibility: string;
	/** Every titled table on the profile tabs, by its heading ("Registered Ph.D. Candidates List"). */
	sections: Record<string, IipsRow[]>;
	/** Entries of the Research > Publication page of the site. */
	listedPublications: string[];
}

const pick = (doc: HTMLElement, label: string): string => {
	for (const tr of doc.querySelectorAll('table tr')) {
		const tds = tr.querySelectorAll('td');
		if (tds.length >= 2 && clean(tds[0].text).toLowerCase() === label.toLowerCase())
			return clean(tds.at(-1)!.text);
	}
	return '';
};

/** Tables inside one tab, grouped under the <b> heading that comes before them. */
function readTab(tab: HTMLElement | null, into: Record<string, IipsRow[]>) {
	if (!tab) return;
	let heading = '';
	for (const node of tab.childNodes as HTMLElement[]) {
		const tag = node.tagName?.toLowerCase();
		if (tag === 'b') heading = clean(node.text).replace(/[:.]+$/, '');
		if (tag !== 'table') continue;
		for (const tr of node.querySelectorAll('tr')) {
			const cells = tr.querySelectorAll('td').map((td) => clean(td.text));
			// drop the serial number column
			if (cells.length > 1 && /^\d+\.?$/.test(cells[0])) cells.shift();
			if (!cells.some(Boolean)) continue;
			const href = tr.querySelector('a')?.getAttribute('href') ?? null;
			const key = heading || 'Untitled';
			(into[key] ??= []).push({ cells, link: href ? clean(href) : null });
		}
	}
}

/** Same size portrait for every card: 5:6, top aligned so the face stays in frame. */
async function portrait(from: string, to: string) {
	mkdirSync(join(to, '..'), { recursive: true });
	await sharp(from)
		.rotate()
		.resize(360, 432, { fit: 'cover', position: 'top' })
		.jpeg({ quality: 80, mozjpeg: true })
		.toFile(to);
}

/** The faculty list: ids and names under "Computer Faculty" and "Management Faculty". */
async function readList() {
	const html = await cachedFetch(LIST_URL, { mixed: true });
	const cs = html.indexOf("faculty('computer')");
	const mg = html.indexOf("faculty('management')");
	if (cs < 0 || mg < 0) throw new Error('faculty list layout changed');
	const people: { iipsId: string; name: string; department: 'cs' | 'mgmt' }[] = [];
	const re = /onclick="profile\('(\d+)'\)"><img[^>]*>([^<]+)</g;
	for (const m of html.matchAll(re)) {
		const at = m.index ?? 0;
		if (at < cs) continue;
		people.push({ iipsId: m[1], name: clean(m[2]), department: at < mg ? 'cs' : 'mgmt' });
	}
	return people;
}

/** The Research > Publication page lists papers per faculty, keyed by name. */
async function readPublicationPages() {
	const byName = new Map<string, string[]>();
	for (const subject of ['computer', 'management']) {
		const doc = parse(await cachedFetch(PUBS_URL, { form: { subject }, mixed: true }));
		for (const panel of doc.querySelectorAll('.paperDiv')) {
			const name = clean(panel.querySelector('.panel-title a')?.text);
			const items = panel.querySelectorAll('.panel-body li').map((li) => clean(li.text));
			byName.set(name.toLowerCase(), items.filter(Boolean));
		}
	}
	return byName;
}

async function main() {
	const list = await readList();
	console.log(`IIPS list: ${list.length} faculty`);
	const listed = await readPublicationPages();
	const out: IipsFaculty[] = [];
	const slugs = new Set<string>();

	for (const [order, person] of list.entries()) {
		const html = await cachedFetch(DETAIL_URL, {
			form: { user_id_display: person.iipsId },
			mixed: true
		});
		const doc = parse(html);
		const name = clean(doc.querySelector('h3')?.text) || person.name;
		let slug = slugify(name);
		if (slugs.has(slug)) slug += '-' + person.iipsId;
		slugs.add(slug);

		const src = doc.querySelector('img.img-thumb')?.getAttribute('src')?.trim() ?? '';
		const photoUrl = src ? new URL(src.replace(/ /g, '%20'), SITE).href : null;
		const generic = !src || /\/(male|female)\.jpg$/i.test(src);
		let photo: string | null = null;
		if (photoUrl && !generic) {
			const original = join(CACHE, 'photos', slug + '.jpg');
			if (await cachedDownload(photoUrl, original)) {
				await portrait(original, join(PORTAL, 'static', 'faculty', slug + '.jpg'));
				photo = `faculty/${slug}.jpg`;
			}
		}

		const sections: Record<string, IipsRow[]> = {};
		for (const id of ['membership', 'research', 'responsibility', 'project'])
			readTab(doc.getElementById(id), sections);

		out.push({
			iipsId: person.iipsId,
			slug,
			name,
			department: person.department,
			order,
			photo,
			photoUrl: generic ? null : photoUrl,
			qualification: pick(doc, 'Qualification'),
			designation: pick(doc, 'Designation'),
			specialization: pick(doc, 'Specialization'),
			industryExperience: pick(doc, 'Industry Experience'),
			teachingExperience: pick(doc, 'Teaching Experience'),
			phone: pick(doc, 'Phone'),
			email: pick(doc, 'E-Mail id'),
			responsibility: pick(doc, 'Responsibility'),
			sections,
			listedPublications: listed.get(name.toLowerCase()) ?? []
		});
		const counts = Object.entries(sections)
			.map(([k, v]) => `${k.slice(0, 18)}: ${v.length}`)
			.join(', ');
		console.log(
			`  ${person.iipsId.padStart(2)} ${name.padEnd(28)} ${photo ? 'photo' : 'no photo'}  ${counts}`
		);
	}

	writeJson(join(OUT, 'iips.json'), {
		fetchedAt: new Date().toISOString(),
		source: LIST_URL,
		faculty: out
	});
	console.log(`Wrote ${out.length} profiles to scripts/data/out/iips.json`);
}

if (import.meta.main) await main();

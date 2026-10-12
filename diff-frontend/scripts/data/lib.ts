/**
 * Shared helpers for the data scripts: a polite, disk cached fetch and small text utilities.
 * Every response is cached under .cache/scrape, so a rerun never hits a site twice.
 * Delete that folder (or one file in it) to refresh.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const ROOT = process.cwd();
export const OUT = join(ROOT, 'scripts', 'data', 'out');
/** The research portal app itself: run the scripts from the repository root. */
export const PORTAL = ROOT;
export const CACHE = join(ROOT, '.cache', 'scrape');

const UA =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

export class BlockedError extends Error {}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Random wait between min and max milliseconds, so requests do not arrive on a fixed beat. */
export const pause = (min: number, max: number) => sleep(min + Math.random() * (max - min));

const lastHit = new Map<string, number>();

interface FetchOptions {
	/** Form fields; when set the request is a POST. */
	form?: Record<string, string>;
	/** Minimum gap between two network requests to the same host. */
	gapMs?: [number, number];
	/** Decode IIPS pages, which mix UTF-8 with stray Windows-1252 bytes. */
	mixed?: boolean;
}

/** GET or POST a page, from the cache when possible. */
export async function cachedFetch(url: string, opts: FetchOptions = {}): Promise<string> {
	const body = opts.form ? new URLSearchParams(opts.form).toString() : '';
	const host = new URL(url).host;
	const key = createHash('sha1')
		.update(url + '|' + body)
		.digest('hex')
		.slice(0, 16);
	const file = join(CACHE, host, key + '.html');
	if (existsSync(file)) return readFileSync(file, 'utf8');

	const [min, max] = opts.gapMs ?? [1000, 1500];
	const wait = (lastHit.get(host) ?? 0) + min + Math.random() * (max - min) - Date.now();
	if (wait > 0) await sleep(wait);
	lastHit.set(host, Date.now());

	let res: Response | undefined;
	for (let attempt = 1; attempt <= 3; attempt++) {
		try {
			res = await fetch(url, {
				method: opts.form ? 'POST' : 'GET',
				headers: {
					'User-Agent': UA,
					'Accept-Language': 'en-US,en;q=0.9',
					...(opts.form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
				},
				body: opts.form ? body : undefined,
				redirect: 'follow'
			});
			if (res.status < 500) break;
		} catch (e) {
			if (attempt === 3) throw e;
		}
		await sleep(3000 * attempt);
	}
	if (!res) throw new Error(`no response from ${url}`);
	if (res.status === 429 || res.url.includes('/sorry/'))
		throw new BlockedError(`${host} is rate limiting us (HTTP ${res.status}). Try again later.`);
	if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

	const bytes = new Uint8Array(await res.arrayBuffer());
	const html = opts.mixed ? decodeMixed(bytes) : new TextDecoder().decode(bytes);
	if (/unusual traffic|not a robot|gs_captcha|recaptcha/i.test(html))
		throw new BlockedError(`${host} answered with a CAPTCHA. Try again later.`);
	if (/accounts\.google\.com\/v3\/signin\/interstitial/.test(html))
		throw new BlockedError(`${host} wants a signed in user for ${url}`);

	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, html);
	return html;
}

/** Download a binary file once. Returns false when the server has no such file. */
export async function cachedDownload(url: string, to: string): Promise<boolean> {
	if (existsSync(to)) return true;
	const res = await fetch(url, { headers: { 'User-Agent': UA } });
	const type = res.headers.get('content-type') ?? '';
	if (!res.ok || !type.startsWith('image/')) return false;
	mkdirSync(dirname(to), { recursive: true });
	writeFileSync(to, new Uint8Array(await res.arrayBuffer()));
	await sleep(400);
	return true;
}

const cp1252 = new TextDecoder('windows-1252');
const utf8 = new TextDecoder('utf-8', { fatal: true });

/** Decodes valid UTF-8 sequences as UTF-8 and any other high byte as Windows-1252. */
export function decodeMixed(bytes: Uint8Array): string {
	let out = '';
	let start = 0;
	let i = 0;
	const flush = (end: number) => {
		if (end > start) out += utf8.decode(bytes.subarray(start, end));
	};
	while (i < bytes.length) {
		const b = bytes[i];
		if (b < 0x80) {
			i++;
			continue;
		}
		const len =
			b >= 0xc2 && b < 0xe0 ? 2 : b >= 0xe0 && b < 0xf0 ? 3 : b >= 0xf0 && b < 0xf5 ? 4 : 0;
		let ok = len > 0 && i + len <= bytes.length;
		for (let k = 1; ok && k < len; k++) ok = (bytes[i + k] & 0xc0) === 0x80;
		if (ok) {
			i += len;
			continue;
		}
		flush(i);
		out += cp1252.decode(bytes.subarray(i, i + 1));
		i++;
		start = i;
	}
	flush(bytes.length);
	return out.replace(/^\uFEFF/, '');
}

/** Collapses whitespace, turns dashes and odd quotes into plain characters, drops entities. */
export function clean(text: string | undefined | null): string {
	return (text ?? '')
		.replace(/&nbsp;|\u00a0/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#0?39;|&apos;/g, "'")
		.replace(/[\u2010-\u2015\u2212]/g, '-')
		.replace(/[\u2018\u2019]/g, "'")
		.replace(/[\u201c\u201d]/g, '"')
		.replace(/\u2026/g, '...')
		.replace(/\s+/g, ' ')
		.trim();
}

/** "Dr. Pradeep K. Jatav" gives "pradeep-k-jatav". */
export function slugify(name: string): string {
	return stripTitle(name)
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

export function stripTitle(name: string): string {
	return name.replace(/^\s*(dr|prof|mr|ms|mrs|shri|smt)\.?\s+/i, '').trim();
}

/** Lower case words of a name without titles or initials' dots: "Dr. S.C. Patidar" gives ["s","c","patidar"]. */
export function nameTokens(name: string): string[] {
	return stripTitle(name)
		.toLowerCase()
		.replace(/[^a-z\s.]/g, ' ')
		.split(/[\s.]+/)
		.filter(Boolean);
}

export function readJson<T>(file: string): T {
	return JSON.parse(readFileSync(file, 'utf8')) as T;
}

export function writeJson(file: string, data: unknown) {
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, JSON.stringify(data, null, '\t') + '\n');
}

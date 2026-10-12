/** Checks the generated data file before it is published. */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import data from '$lib/data/faculty.json';
import { FLAG_LABELS, PUB_TYPES, type PubFlag } from '$lib/domain/types';

const FLAGS = Object.keys(FLAG_LABELS) as [PubFlag, ...PubFlag[]];

const Pub = z.object({
	title: z.string().min(1),
	authors: z.string(),
	venue: z.string(),
	year: z.number().int().min(1950).max(2100).nullable(),
	citations: z.number().int().min(0),
	type: z.enum(PUB_TYPES),
	flag: z.enum(FLAGS).nullable(),
	key: z.string()
});

const Faculty = z.object({
	slug: z.string().regex(/^[a-z0-9-]+$/),
	iipsId: z.string().regex(/^\d+$/),
	name: z.string().regex(/^(Dr|Mr|Ms|Mrs|Prof)\. /),
	department: z.enum(['cs', 'mgmt']),
	designation: z.string().min(1),
	photo: z.string().nullable(),
	emails: z.array(z.string().email()),
	phd: z.array(
		z.object({
			name: z.string().min(1),
			topic: z.string(),
			status: z.enum(['awarded', 'submitted', 'ongoing'])
		})
	),
	scholar: z
		.object({
			id: z.string().regex(/^[\w-]{12}$/),
			match: z.object({
				confidence: z.enum(['high', 'medium', 'low']),
				evidence: z.array(z.string())
			}),
			publications: z.array(Pub)
		})
		.nullable(),
	openalex: z
		.object({
			ids: z.array(z.string().regex(/^A[0-9]+$/)).min(1),
			orcid: z.string().url().nullable(),
			match: z.object({
				confidence: z.enum(['high', 'medium', 'low']),
				evidence: z.array(z.string()).min(1)
			}),
			publications: z.array(Pub)
		})
		.nullable()
});

const File = z.object({
	version: z.literal(1),
	updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	faculty: z.array(Faculty)
});

describe('faculty.json', () => {
	it('matches the expected shape', () => {
		const r = File.safeParse(data);
		expect(r.success, r.success ? '' : JSON.stringify(r.error.issues.slice(0, 3))).toBe(true);
	});

	it('has every IIPS faculty member once', () => {
		const slugs = data.faculty.map((f) => f.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
		expect(new Set(data.faculty.map((f) => f.iipsId)).size).toBe(slugs.length);
		expect(data.faculty.length).toBeGreaterThanOrEqual(40);
		expect(data.faculty.some((f) => f.department === 'cs')).toBe(true);
		expect(data.faculty.some((f) => f.department === 'mgmt')).toBe(true);
	});

	it('has a photo file for every photo', () => {
		for (const f of data.faculty)
			if (f.photo) expect(existsSync(join('static', f.photo)), f.photo).toBe(true);
	});

	it('only links Scholar profiles that were matched on evidence or by hand', () => {
		for (const f of data.faculty) {
			if (!f.scholar) continue;
			const m = f.scholar.match;
			expect(m.decidedBy === 'override' || m.confidence !== 'low', f.name).toBe(true);
			if (m.decidedBy === 'evidence') expect(m.evidence.length, f.name).toBeGreaterThan(1);
		}
	});

	it('never links one profile to two people', () => {
		const ids = data.faculty.flatMap((f) => (f.scholar ? [f.scholar.id] : []));
		expect(new Set(ids).size).toBe(ids.length);
		const oa = data.faculty.flatMap((f) => f.openalex?.ids ?? []);
		expect(new Set(oa).size).toBe(oa.length);
	});

	it('only links OpenAlex records that were matched on evidence', () => {
		for (const f of data.faculty)
			if (f.openalex) expect(f.openalex.match.confidence, f.name).not.toBe('low');
	});
});

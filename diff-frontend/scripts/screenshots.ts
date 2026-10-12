import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4190';
const OUT = join(process.cwd(), 'docs', 'screens');
mkdirSync(OUT, { recursive: true });

const shots: { name: string; path: string; width: number; height: number; scroll?: string }[] = [
	{ name: 'home', path: '/', width: 1280, height: 800 },
	{ name: 'faculty', path: '/faculty', width: 1280, height: 800 },
	{ name: 'profile', path: '/faculty/kirti-mathur', width: 1280, height: 860 },
	{ name: 'scores', path: '/scores', width: 1280, height: 800 },
	{ name: 'method', path: '/method', width: 1280, height: 800, scroll: '.curve-row' },
	{ name: 'mobile', path: '/faculty/kirti-mathur', width: 390, height: 780 }
];

const browser = await chromium.launch();
for (const s of shots) {
	const page = await browser.newPage({
		viewport: { width: s.width, height: s.height },
		deviceScaleFactor: s.width < 500 ? 2 : 1
	});
	await page.goto(BASE + s.path, { waitUntil: 'networkidle' });
	if (s.scroll) await page.locator(s.scroll).scrollIntoViewIfNeeded();
	const png = await page.screenshot();
	await sharp(png)
		.webp({ quality: 82 })
		.toFile(join(OUT, `${s.name}.webp`));
	await page.close();
	console.log(`saved docs/screens/${s.name}.webp`);
}
await browser.close();

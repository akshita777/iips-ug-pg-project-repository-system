import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
	'/',
	'/faculty',
	'/faculty/kirti-mathur',
	'/faculty/shilpa-bagdare',
	'/scores',
	'/method',
	'/data-check'
];

for (const path of PAGES) {
	test(`${path} has no accessibility violations`, async ({ page }) => {
		await page.goto(path);
		const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
		expect(violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
	});

	// pages stay readable without scripts, but filters, search and sort need every script loaded
	test(`${path} loads every file and runs without errors`, async ({ page }) => {
		const problems: string[] = [];
		page.on('pageerror', (e) => problems.push(e.message));
		page.on('response', (r) => {
			if (r.status() >= 400 && r.url().startsWith(new URL(page.url() || 'http://x').origin))
				problems.push(`${r.status()} ${r.url()}`);
		});
		await page.goto(path, { waitUntil: 'networkidle' });
		expect(problems).toEqual([]);
	});
}

test('home shows the totals and links to the directory', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Research Portal');
	await expect(page.getByText('Publications:')).toBeVisible();
	await page.getByRole('link', { name: 'Browse Faculty' }).click();
	await expect(page).toHaveURL(/\/faculty$/);
});

test('directory department buttons show only that department', async ({ page }) => {
	await page.goto('/faculty');
	const cards = page.locator('article.fc');
	await expect(cards).toHaveCount(42);
	await page.getByRole('button', { name: /^Computer/ }).click();
	await expect(cards).toHaveCount(17);
	await expect(page.getByRole('button', { name: /^Computer/ })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await page.getByRole('button', { name: /^Management/ }).click();
	await expect(cards).toHaveCount(25);
	await page.getByRole('button', { name: /^All/ }).click();
	await expect(cards).toHaveCount(42);
});

test('directory search finds people by name or research area', async ({ page }) => {
	await page.goto('/faculty');
	const cards = page.locator('article.fc');
	const search = page.getByPlaceholder('Name or research area');
	await search.fill('Kirti Mathur');
	await expect(cards).toHaveCount(1);
	await search.fill('marketing');
	expect(await cards.count()).toBeGreaterThan(0);
	await search.fill('zzzz');
	await expect(page.getByText('No faculty match')).toBeVisible();
	await page.getByRole('button', { name: 'Clear search' }).click();
	await expect(cards).toHaveCount(42);
});

test('directory sorts by surname, score and citations', async ({ page }) => {
	await page.goto('/faculty');
	const names = () => page.locator('article.fc h3').allTextContents();
	const sort = page.getByLabel('Sort');

	await sort.selectOption('name');
	const bySurname = await names();
	const surnames = bySurname.map((n) => n.split(' ').at(-1)!);
	expect(surnames).toEqual([...surnames].sort((a, b) => a.localeCompare(b)));

	await sort.selectOption('citations');
	const cites = await page.locator('article.fc dd').nth(1).textContent();
	const firstCites = Number(cites!.replace(/,/g, ''));
	const lastCard = page.locator('article.fc').last();
	const lastCites = Number((await lastCard.locator('dd').nth(1).textContent())!.replace(/,/g, ''));
	expect(firstCites).toBeGreaterThanOrEqual(lastCites);

	await sort.selectOption('score');
	expect((await names())[0]).not.toEqual(bySurname[0]);
});

test('a search link from the home page opens the directory filtered', async ({ page }) => {
	await page.goto('/faculty?q=Marketing');
	await expect(page.getByPlaceholder('Name or research area')).toHaveValue('Marketing');
});

test('profile shows the index, the radar, the Scholar link and its evidence', async ({ page }) => {
	await page.goto('/faculty/kirti-mathur');
	await expect(page.getByRole('heading', { level: 1, name: 'Dr. Kirti Mathur' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Research Index' })).toBeVisible();
	await expect(page.getByRole('img', { name: /Score by pillar/ })).toBeVisible();
	await expect(page.getByRole('link', { name: /Google Scholar/ }).first()).toHaveAttribute(
		'href',
		/scholar\.google\.com\/citations\?user=SOnwU8YAAAAJ/
	);
	await expect(page.getByText('Verified email at iips.edu.in')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Ph.D. Scholars' })).toBeVisible();
	// namesake papers from the 1980s are listed as not counted
	await page.getByText(/^Not counted/).click();
	await expect(
		page.getByText('Japanese encephalitis virus infection during pregnancy')
	).toBeVisible();
});

test('a profile without Scholar uses OpenAlex', async ({ page }) => {
	await page.goto('/faculty/shilpa-bagdare');
	await expect(page.getByText('From OpenAlex')).toBeVisible();
	await expect(page.getByRole('link', { name: /^OpenAlex/ }).first()).toHaveAttribute(
		'href',
		/openalex\.org\/A\d+/
	);
	expect(await page.locator('ol.pubs > li').count()).toBeGreaterThan(5);
});

test('the Scholar search link uses the plain name', async ({ page }) => {
	await page.goto('/faculty/rajesh-verma');
	const href = await page.getByRole('link', { name: /Search Scholar/ }).getAttribute('href');
	expect(decodeURIComponent(href!)).toContain('q=Rajesh Verma');
	expect(href).not.toContain('Mr.');
});

test('profile publication filter narrows the list', async ({ page }) => {
	await page.goto('/faculty/kirti-mathur');
	const items = page.locator('ol.pubs > li');
	const before = await items.count();
	await page
		.getByRole('group', { name: 'Type' })
		.getByRole('button', { name: /^Conference/ })
		.click();
	expect(await items.count()).toBeLessThan(before);
});

test('scores table ranks everyone and filters by department', async ({ page }) => {
	await page.goto('/scores');
	const rows = page.locator('table.scores tbody tr');
	await expect(rows).toHaveCount(42);
	await page
		.getByRole('group', { name: 'Department' })
		.getByRole('button', { name: 'Management' })
		.click();
	await expect(rows).toHaveCount(25);
});

test('data check filters to profiles not found', async ({ page }) => {
	await page.goto('/data-check');
	await page.getByRole('button', { name: /Not found/ }).click();
	await expect(page.locator('tbody tr').first()).toContainText('Search Google Scholar');
});

test('unknown faculty address shows a 404 page', async ({ page }) => {
	const res = await page.goto('/faculty/nobody-here');
	expect(res?.status()).toBe(404);
});

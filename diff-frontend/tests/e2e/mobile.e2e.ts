import { expect, test } from '@playwright/test';

test('phone menu opens and navigates', async ({ page }) => {
	await page.goto('/');
	const menu = page.getByRole('button', { name: 'Menu' });
	await expect(menu).toBeVisible();
	await menu.click();
	await page
		.getByRole('navigation', { name: 'Main' })
		.getByRole('link', { name: 'Research Scores' })
		.click();
	await expect(page).toHaveURL(/\/scores$/);
	await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('pages do not scroll sideways on a phone', async ({ page }) => {
	for (const path of [
		'/',
		'/faculty',
		'/faculty/kirti-mathur',
		'/scores',
		'/method',
		'/data-check'
	]) {
		await page.goto(path);
		const wide = await page.evaluate(
			() => document.documentElement.scrollWidth > window.innerWidth + 1
		);
		expect(wide, path).toBe(false);
	}
});

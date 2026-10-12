/** "2026-10-02" gives "2 Oct 2026". */
export function longDate(iso: string): string {
	const d = new Date(iso + 'T00:00:00Z');
	return d.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	});
}

/** Indian digit grouping: 12,345 or 1,23,456. */
export const n = (x: number) => x.toLocaleString('en-IN');

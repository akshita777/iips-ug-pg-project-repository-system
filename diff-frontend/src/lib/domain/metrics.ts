/** Pure research metrics. */

export function hIndex(citations: readonly number[]): number {
	const sorted = [...citations].sort((a, b) => b - a);
	let h = 0;
	while (h < sorted.length && sorted[h] >= h + 1) h++;
	return h;
}

export function i10Index(citations: readonly number[]): number {
	return citations.filter((c) => c >= 10).length;
}

/** First four digit year in a citation string such as "Thakur, R. (2014). Context free ...". */
export function yearIn(text: string): number | null {
	const m = /\b(19[5-9]\d|20\d{2})\b/.exec(text);
	return m ? Number(m[1]) : null;
}

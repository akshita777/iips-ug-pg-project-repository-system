<script lang="ts">
	/** Five pillar radar, as SVG: this person filled, the IIPS median dashed. */
	let {
		labels,
		values,
		compare,
		max = 20
	}: { labels: string[]; values: number[]; compare: number[]; max?: number } = $props();

	const SIZE = 300;
	const C = SIZE / 2;
	const R = 98;
	const n = $derived(labels.length);

	const at = (i: number, r: number) => {
		const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
		return [C + r * Math.cos(a), C + r * Math.sin(a)];
	};
	const shape = (vs: number[]) =>
		vs.map((v, i) => at(i, (Math.min(v, max) / max) * R).join(',')).join(' ');
	const ring = (f: number) => labels.map((_, i) => at(i, R * f).join(',')).join(' ');
</script>

<figure class="radar">
	<svg
		viewBox="0 0 {SIZE} {SIZE}"
		role="img"
		aria-label="Score by pillar: {labels.map((l, i) => `${l} ${values[i]} of ${max}`).join(', ')}"
	>
		{#each [0.25, 0.5, 0.75, 1] as f (f)}
			<polygon points={ring(f)} class="grid" />
		{/each}
		{#each labels as _, i (i)}
			{@const [x, y] = at(i, R)}
			<line x1={C} y1={C} x2={x} y2={y} class="grid" />
		{/each}
		<polygon points={shape(compare)} class="median" />
		<polygon points={shape(values)} class="me" />
		{#each values as v, i (i)}
			{@const [x, y] = at(i, (Math.min(v, max) / max) * R)}
			<circle cx={x} cy={y} r="3.5" class="dot" />
		{/each}
		{#each labels as l, i (l)}
			{@const [x, y] = at(i, R + 26)}
			<text {x} y={y + 4} class="label">{l}</text>
		{/each}
	</svg>
	<figcaption>
		<span class="key me-key"></span> This person
		<span class="key median-key"></span> IIPS median
	</figcaption>
</figure>

<style>
	.radar {
		margin: 0;
	}
	svg {
		display: block;
		width: 100%;
		max-width: 300px;
		margin: 0 auto;
		overflow: visible;
	}
	.grid {
		fill: none;
		stroke: var(--line);
	}
	.median {
		fill: none;
		stroke: var(--muted);
		stroke-width: 1.5;
		stroke-dasharray: 4 3;
	}
	.me {
		fill: rgb(0 98 155 / 0.22);
		stroke: var(--blue);
		stroke-width: 2;
	}
	.dot {
		fill: var(--blue);
	}
	.label {
		font-size: 11.5px;
		font-weight: 600;
		fill: var(--text-2);
		text-anchor: middle;
	}
	figcaption {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 6px;
		font-size: 0.82rem;
		color: var(--text-2);
		margin-top: 6px;
	}
	.key {
		display: inline-block;
		width: 18px;
		height: 0;
		border-top: 3px solid var(--blue);
		margin-left: 10px;
	}
	.median-key {
		border-top: 2px dashed var(--muted);
	}
</style>

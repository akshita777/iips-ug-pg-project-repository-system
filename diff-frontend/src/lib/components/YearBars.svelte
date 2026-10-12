<script lang="ts">
	/** Simple bar chart, drawn as SVG so it shows without JavaScript and prints well. */
	let { data, label }: { data: { year: number; count: number }[]; label: string } = $props();

	const H = 150;
	const BAR = 26;
	const GAP = 10;
	const max = $derived(Math.max(1, ...data.map((d) => d.count)));
	const width = $derived(data.length * (BAR + GAP) + GAP);
</script>

<figure class="chart">
	<div class="scroll">
		<svg
			viewBox="0 0 {width} {H + 44}"
			{width}
			height={H + 44}
			role="img"
			aria-label="{label}: {data.map((d) => `${d.year} ${d.count}`).join(', ')}"
		>
			<line x1="0" x2={width} y1={H + 18} y2={H + 18} class="axis" />
			{#each data as d, i (d.year)}
				{@const h = Math.round((d.count / max) * H)}
				{@const x = GAP + i * (BAR + GAP)}
				<rect {x} y={H + 18 - h} width={BAR} height={h} rx="2" class="bar" />
				{#if d.count}
					<text x={x + BAR / 2} y={H + 13 - h} class="val">{d.count}</text>
				{/if}
				<text x={x + BAR / 2} y={H + 36} class="year">'{String(d.year).slice(2)}</text>
			{/each}
		</svg>
	</div>
	<figcaption class="sr-only">{label}</figcaption>
</figure>

<style>
	.chart {
		margin: 0;
	}
	.scroll {
		overflow-x: auto;
	}
	svg {
		display: block;
		max-width: none;
	}
	.bar {
		fill: var(--blue);
	}
	.axis {
		stroke: var(--line-strong);
	}
	.val {
		font-size: 11px;
		fill: var(--text-2);
		text-anchor: middle;
		font-weight: 600;
	}
	.year {
		font-size: 12px;
		fill: var(--muted);
		text-anchor: middle;
	}
</style>
